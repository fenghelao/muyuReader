import { useEffect, useRef } from 'react'
import { useStore } from './store'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Thread from './components/Thread'
import Composer from './components/Composer'
import Decoy from './components/Decoy'
import ReaderView from './components/ReaderView'

export default function App() {
  const theme = useStore((s) => s.theme)
  const displayMode = useStore((s) => s.displayMode)
  const readerFont = useStore((s) => s.readerFont)
  const setBoss = useStore((s) => s.setBoss)
  const hydrateLibrary = useStore((s) => s.hydrateLibrary)
  const advance = useStore((s) => s.advance)
  const retreat = useStore((s) => s.retreat)
  const readerStep = useStore((s) => s.readerStep)
  const keyNavLock = useRef(0)

  // 主题 / 字号 → 根元素 CSS(§4)
  useEffect(() => {
    void hydrateLibrary()
  }, [hydrateLibrary])

  useEffect(() => {
    let cleanup: (() => void) | undefined
    void window.api?.getBossState?.().then((bossOn) => {
      useStore.setState({ bossOn })
    })
    cleanup = window.api?.onBossChanged?.((bossOn) => {
      useStore.setState({ bossOn })
    })
    return () => cleanup?.()
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  useEffect(() => {
    document.documentElement.style.setProperty('--reader-font', readerFont + 'px')
  }, [readerFont])

  // Electron handles the global focus shortcut in the main process.
  // Browser preview falls back to Esc + an in-page placeholder view.
  useEffect(() => {
    const isElectron = !!window.api
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && !isElectron) {
        e.preventDefault()
        setBoss(!useStore.getState().bossOn)
        return
      }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      const target = e.target
      if (target instanceof HTMLElement && target.isContentEditable) return
      if (target instanceof HTMLInputElement && target.value.trim()) return
      if (target instanceof HTMLTextAreaElement && target.value.trim()) return
      const now = performance.now()
      if (now - keyNavLock.current < 220) return
      keyNavLock.current = now
      e.preventDefault()
      if (useStore.getState().displayMode === 'reader') {
        readerStep(e.key === 'ArrowDown' ? 1 : -1)
        return
      }
      if (e.key === 'ArrowDown') {
        advance()
      } else {
        retreat()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [advance, readerStep, retreat, setBoss])

  return (
    <>
      <div className="app">
        <Sidebar />
        <main className="main">
          <TopBar />
          {displayMode === 'reader' ? (
            <ReaderView />
          ) : (
            <>
              <Thread />
              <Composer />
            </>
          )}
        </main>
      </div>
      <Decoy />
    </>
  )
}
