import { useSettingLabel } from './settingLabel'

/** The one on/off control for settings that apply immediately. The off state keeps a visible track and knob. */
export function SettingSwitch({ checked, onChange, label, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; label?: string; disabled?: boolean }): React.JSX.Element {
  const name = useSettingLabel(label)
  return (
    <button
      type="button"
      role="switch"
      aria-label={name}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${checked ? 'bg-focus' : 'bg-transparent ring-[1.5px] ring-inset ring-muted'}`}
    >
      <span className={`absolute top-1 left-1 size-6 rounded-full shadow-sm transition-transform ${checked ? 'translate-x-6 bg-on-accent' : 'bg-muted'}`} />
    </button>
  )
}
