import type { ReactNode } from 'react'

/** An app-drawn title strip; Windows draws only its three caption controls.
 * Its physical height stays 36px when the interface scale changes. */
export function WindowFrame({ children }: { children: ReactNode }): React.JSX.Element {
  const customChrome = navigator.userAgent.includes('Windows')
  return <div className="app-window-frame h-viewport">
    {customChrome && <header className="app-window-titlebar" aria-label="A14 Pomodoro">
      <span className="app-window-mark" aria-hidden="true">A14</span>
      <span>A14 Pomodoro</span>
    </header>}
    <div className="app-window-content">{children}</div>
  </div>
}
