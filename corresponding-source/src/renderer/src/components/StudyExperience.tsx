import { t } from '../i18n'
import { useSession, useSettings } from '../store/session'

export function StudyExperience({framed=true}:{framed?:boolean}={}):React.JSX.Element {
  const {settings,set}=useSettings(),state=useSession(s=>s.state)
  const busy=state.stage!=='idle'||!!state.recovery
  return <fieldset disabled={busy} className={framed?"rounded-xl border border-line p-4":""}><legend className={framed?"px-2 font-semibold":"mb-3 text-lg font-semibold"}>{t('Study experience')}</legend><div className="grid gap-3 sm:grid-cols-2">{(['quick','full'] as const).map(mode=><label key={mode} className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-3 has-[:checked]:border-focus has-[:checked]:bg-focus/5"><input type="radio" name="study-experience" value={mode} checked={settings.studyExperience===mode} onChange={()=>void set('studyExperience',mode)} className="mt-1"/><span><strong className="block">{t(mode==='quick'?'Quick Mode':'Full Mode')}</strong><span className="block text-sm text-muted">{t(mode==='quick'?'Timer only. Optional breaks; no recall or questions.':'Preparation, recall, reflection and rest.')}</span></span></label>)}</div><p className="mt-3 text-sm text-muted">{t(busy?'Finish the current study step before switching modes.':'Switch modes between sessions. History and preferences stay shared.')}</p></fieldset>
}
