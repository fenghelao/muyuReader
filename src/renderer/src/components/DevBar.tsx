import { useStore } from '../store'

// 临时开发控制条(M1 用于试玩;正式版并入外观设置)
export default function DevBar() {
  const mode = useStore((s) => s.mode)
  const toggleMode = useStore((s) => s.toggleMode)
  const bumpFont = useStore((s) => s.bumpFont)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const toggleBoss = useStore((s) => s.toggleBoss)

  return (
    <div className="demo">
      <b>原型</b>
      <button onClick={toggleMode}>排版:{mode === 'mixed' ? '混合' : '常规'}</button>
      <button onClick={() => bumpFont(-1)} title="减小字号">
        A−
      </button>
      <button onClick={() => bumpFont(1)} title="增大字号">
        A+
      </button>
      <button onClick={toggleTheme}>亮/暗</button>
      <button onClick={toggleBoss}>老板键 Esc</button>
    </div>
  )
}
