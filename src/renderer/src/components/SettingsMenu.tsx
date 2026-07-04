import { useEffect, useState } from 'react'
import { useStore } from '../store'
import { Dots } from './icons'

export default function SettingsMenu() {
  const mode = useStore((s) => s.mode)
  const displayMode = useStore((s) => s.displayMode)
  const theme = useStore((s) => s.theme)
  const toggleMode = useStore((s) => s.toggleMode)
  const setDisplayMode = useStore((s) => s.setDisplayMode)
  const bumpFont = useStore((s) => s.bumpFont)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const toggleBoss = useStore((s) => s.toggleBoss)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = (): void => setOpen(false)
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('click', close)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="settings-wrap">
      <button
        className="tb-btn tb-ico"
        title="More"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
      >
        <Dots className="icon icon-sm" />
      </button>
      {open && (
        <div
          className="settings-menu"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <div className="settings-row">
            <span>View</span>
            <div>
              <button className={displayMode === 'chat' ? 'is-active' : ''} onClick={() => setDisplayMode('chat')}>
                Claude
              </button>
              <button className={displayMode === 'reader' ? 'is-active' : ''} onClick={() => setDisplayMode('reader')}>
                Reader
              </button>
            </div>
          </div>
          <button onClick={toggleMode}>Style: {mode === 'mixed' ? 'Mixed' : 'Regular'}</button>
          <div className="settings-row">
            <span>Text size</span>
            <div>
              <button onClick={() => bumpFont(-1)} title="Smaller text">
                A-
              </button>
              <button onClick={() => bumpFont(1)} title="Larger text">
                A+
              </button>
            </div>
          </div>
          <button onClick={toggleTheme}>Theme: {theme === 'dark' ? 'Dark' : 'Light'}</button>
          <button onClick={toggleBoss}>Hide window</button>
        </div>
      )}
    </div>
  )
}
