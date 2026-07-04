import { useEffect } from 'react'
import { useStore } from './store'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Thread from './components/Thread'
import Composer from './components/Composer'
import Decoy from './components/Decoy'
import DevBar from './components/DevBar'

export default function App() {
  const theme = useStore((s) => s.theme)
  const readerFont = useStore((s) => s.readerFont)
  const toggleBoss = useStore((s) => s.toggleBoss)

  // 主题 / 字号 → 根元素 CSS(§4)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  useEffect(() => {
    document.documentElement.style.setProperty('--reader-font', readerFont + 'px')
  }, [readerFont])

  // 老板键:Electron 全局快捷键(window.api,主进程转发)+ 浏览器 Esc 兜底
  useEffect(() => {
    const off = window.api?.onBossToggle(() => toggleBoss())
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault()
        toggleBoss()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      off?.()
      document.removeEventListener('keydown', onKey)
    }
  }, [toggleBoss])

  return (
    <>
      <div className="app">
        <Sidebar />
        <main className="main">
          <TopBar />
          <Thread />
          <Composer />
        </main>
      </div>
      <Decoy />
      <DevBar />
    </>
  )
}
