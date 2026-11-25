import { t as uiText } from '../i18n'
import { useEffect, useState } from 'react'
import type { TimerMode } from '@core/timer'
import { MODES, type NextBlockPlan } from '../store/plan'
import { MODE_EXPLAINED, ModeDiagram } from './ModeDiagram'
import { TimeInput } from './NumberInputs'
import { useSettings } from '../store/session'
import { inputBase } from './ui'
import { radioKeyboard } from './radioKeyboard'

/** Timer mode as one segmented control, with a small picture of the selected mode under it. */
export function ModeControl({
  value,
  onChange,
  itemId,
  targetSeconds,
  compact = false
}: {
  value: TimerMode
  onChange: (m: TimerMode) => void
  /** For the Adaptive picture: the subject and its suggested length. */
  itemId?: number | null
  targetSeconds?: number
  compact?: boolean
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <div role="radiogroup" onKeyDown={radioKeyboard} aria-label={uiText("Timer mode")} className="grid grid-cols-3 rounded-xl bg-surface-2 p-1">
        {MODES.map((m) => {
          const on = m.value === value
          return (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              title={uiText(MODE_EXPLAINED[m.value])}
              onClick={() => onChange(m.value)}
              className={`min-h-11 rounded-lg text-base transition ${on ? 'bg-selected font-semibold text-selected-ink shadow-sm ring-1 ring-selected-line' : 'text-muted hover:text-ink'}`}
            >
              {uiText(m.label)}
            </button>
          )
        })}
      </div>
      {!compact && <ModeDiagram mode={value} itemId={itemId} targetSeconds={targetSeconds} />}
    </div>
  )
}

const PRESETS = [15, 25, 35, 45]

/** A length as preset chips (15, 25, 35, 45) plus a custom number of minutes. */
export function LengthChips({ value, onChange, label }: { value: number; onChange: (minutes: number) => void; label?: string }): React.JSX.Element {
  const custom = !PRESETS.includes(value)
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label ?? 'Length'}>
      {PRESETS.map((m) => (
        <button
          key={m}
          type="button"
          aria-pressed={value === m}
          onClick={() => onChange(m)}
          className={`min-h-10 min-w-14 rounded-full border px-3 text-base tabular-nums transition ${value === m ? 'border-selected-line bg-selected font-semibold text-selected-ink' : 'border-line hover:border-muted'}`}
        >
          {m}
        </button>
      ))}
      <span className="flex items-center gap-2">
        <TimeInput
          label={uiText("Other length (minutes, or h:mm)")}
          placeholder={uiText("other")}
          min={1}
          max={240}
          value={custom ? value : null}
          onChange={(m) => m && onChange(m)}
          className={`w-24 rounded-full ${custom ? 'border-selected-line bg-selected' : ''}`}
        />
        <span className="text-sm text-muted">{uiText("min")}</span>
      </span>
    </div>
  )
}

/**
 * The length for the chosen mode. Only Fixed asks for minutes: Flow lets you
 * keep going, and Adaptive sets its own length from your past sessions.
 */
export function LengthForMode({ plan }: { plan: NextBlockPlan }): React.JSX.Element | null {
  const { settings, set } = useSettings()
  if (plan.mode !== 'fixed') return null
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-muted">{uiText("Counts down from (minutes)")}</span>
      <LengthChips label="Countdown length" value={settings.fixedMinutes} onChange={(m) => void set('fixedMinutes', m)} />
    </div>
  )
}

/**
 * "What do I want to get done?" for the next session (optional). The caller
 * keeps the text (see useGoalDraft) so Start always sends what was typed.
 */
export function GoalField({ value, onChange }: { value: string; onChange: (v: string) => void }): React.JSX.Element | null {
  const enabled = useSettings((s) => s.settings.captures.goal)
  if (!enabled) return null
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-muted">{uiText("Session goal (optional)")}</span>
      <input dir="auto" className={`${inputBase} w-full`} placeholder={uiText("What do I want to get done?")} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

/** The goal typed for the next session, kept in settings so it survives leaving Home. */
export function useGoalDraft(): [string, (v: string) => void] {
  const { settings, set } = useSettings()
  const [text, setText] = useState(settings.nextGoal)
  // Starting a session clears the saved goal; follow that.
  useEffect(() => {
    if (settings.nextGoal === '') setText('')
  }, [settings.nextGoal])
  useEffect(() => {
    if (text === settings.nextGoal) return
    const t = setTimeout(() => void set('nextGoal', text), 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])
  return [settings.captures.goal ? text : '', setText]
}
