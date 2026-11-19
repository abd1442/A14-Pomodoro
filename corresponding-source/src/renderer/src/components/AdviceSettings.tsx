import { useState } from 'react'
import { t } from '../i18n'
import { AdviceCard } from './AdviceCard'
import { Button } from './ui'
export function OptionalAdvice():React.JSX.Element {
  const [open,setOpen]=useState(false)
  return <div className="mt-3"><Button variant="ghost" aria-expanded={open} onClick={()=>setOpen(!open)}>{t('General study strategies')}</Button>{open&&<AdviceCard surface="stats"/>}</div>
}
export function AdviceSettings():React.JSX.Element {
  const [status,setStatus]=useState(''),[busy,setBusy]=useState(false)
  return <div className="flex flex-col gap-3"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0 max-w-prose"><h3 className="text-lg font-semibold">{t('Study suggestions')}</h3><p className="mt-1 text-sm text-muted">{t('Rotation stays on this device. Less of a topic hides its concepts until reset. Reset clears only suggestion history and hidden topics.')}</p></div><Button disabled={busy} onClick={()=>{setBusy(true);void window.api.invoke('advice:reset').then(()=>setStatus('Study suggestions reset. Your study records are unchanged.')).catch(()=>setStatus('Could not load study suggestions. Try again.')).finally(()=>setBusy(false))}}>{t('Reset study suggestions')}</Button></div><p role="status" className="text-sm empty:hidden">{t(status)}</p></div>
}
