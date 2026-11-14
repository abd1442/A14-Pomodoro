import {useEffect,useState} from 'react'
import type {IpcContract} from '@core/api'
export function CoachConnection():React.JSX.Element{
  const[status,setStatus]=useState<IpcContract['coach:syncStatus']['result']>(),[failed,setFailed]=useState(false)
  useEffect(()=>{let live=true;const refresh=():void=>{void window.api.invoke('coach:syncStatus').then(value=>{if(live){setStatus(value);setFailed(false)}}).catch(()=>{if(live)setFailed(true)})};refresh();const timer=setInterval(refresh,2000);return()=>{live=false;clearInterval(timer)}},[])
  const label=failed?'Connection status unavailable':!status?'Checking connection…':status.state==='synced'?'Coach is up to date':status.state==='waiting'?'Waiting for Coach':status.state==='offline'?'Sync isolated for this profile':'Sync needs attention'
  return <div className="flex flex-col gap-4 p-6"><div className="flex flex-wrap items-center justify-between gap-4"><h3 className="text-lg font-semibold">Automatic study sync</h3><strong role="status">{label}</strong></div><p className="text-muted">Saved sessions, corrections and deletions appear in A14 Coach automatically while it is open. Coach catches up when it reopens.</p>{status?.lastSyncAt&&<p className="text-sm text-muted">Last acknowledged: {new Date(status.lastSyncAt).toLocaleTimeString()} · revision {status.revision}</p>}{status?.message&&<p role={status.state==='error'?'alert':'status'} className="text-sm text-muted">{status.message}</p>}<p className="text-sm text-muted">Study records stay in Pomodoro. No account or network connection is needed.</p></div>
}
