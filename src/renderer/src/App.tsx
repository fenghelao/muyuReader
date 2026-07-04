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

  // 老板键:Electron 里由主进程全局快捷键切 WebContentsView(§9.1),渲染层不处理;
  // 纯浏览器(无 window.api)用 Esc + 页面内 decoy 兜底。
  useEffect(() => {
    const isElectron = !!window.api
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && !isElectron) {
        e.preventDefault()
        toggleBoss()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
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
