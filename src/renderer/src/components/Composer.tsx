import { useRef } from 'react'
import { useStore } from '../store'
import { Chevron, Plus, SendArrow } from './icons'

// Composer = 翻页器:回车/发送 = 推进下一段(§5.5)
export default function Composer() {
  const advance = useStore((s) => s.advance)
  const ref = useRef<HTMLTextAreaElement>(null)

  const send = (): void => {
    const t = ref.current
    if (t) {
      t.value = ''
      t.style.height = 'auto'
    }
    advance()
  }

  return (
    <div className="composer-wrap">
      <div className="composer">
        <textarea
          ref={ref}
          rows={1}
          placeholder="Message Claude…"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          onInput={(e) => {
            const t = e.currentTarget
            t.style.height = 'auto'
            t.style.height = Math.min(t.scrollHeight, 180) + 'px'
          }}
        />
        <div className="composer-tools">
          <button className="ctool" title="附件">
            <Plus className="icon icon-sm" />
          </button>
          <div className="cmodel">
            Claude Opus 4.8 <Chevron className="icon icon-sm" />
          </div>
          <button className="send" title="发送 (Enter)" onClick={send}>
            <SendArrow className="icon" />
          </button>
        </div>
      </div>
      <div className="hint">回车 = 翻到下一段 · Esc = 老板键 · 右下角可切排版/字号/亮暗 · 内容仅本地</div>
    </div>
  )
}
