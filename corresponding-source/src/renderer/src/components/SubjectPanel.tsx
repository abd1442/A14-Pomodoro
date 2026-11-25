export const subjectPanelStyle=(color:string):React.CSSProperties=>({'--panel-colour':color} as React.CSSProperties)

/** The subject's colour as a quiet line along the bottom of the card. */
export function SubjectCardAccent():React.JSX.Element {
  return <><span aria-hidden="true" data-whisper-rule className="pointer-events-none absolute bottom-[13px] left-6 right-6 h-[2px] rounded-full" style={{background:'var(--panel-colour)',opacity:.7}}/></>
}
