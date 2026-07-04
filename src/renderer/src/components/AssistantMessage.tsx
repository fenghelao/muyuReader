import { useEffect, useRef, useState } from 'react'
import type { Message } from '../store'
import { useStore } from '../store'
import { BLOCKS } from '../disguise/content'
import { buildSegments, buildThinking, thinkDelayMs } from '../disguise/composer'
import { buildInstant, streamSegments } from '../disguise/stream'
import type { Segment } from '../disguise/types'
import ThinkBlock from './ThinkBlock'

const END_NOTE = '（本章到这儿。剩下的，明天上班再看。）'

export default function AssistantMessage({ msg, onScroll }: { msg: Message; onScroll: () => void }) {
  const mode = useStore((s) => s.mode)
  const setTyping = useStore((s) => s.setTyping)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<'thinking' | 'show'>(msg.animate ? 'thinking' : 'show')

  const i = msg.blockIndex ?? 0
  const thinking = mode === 'mixed' && !msg.endNote ? buildThinking(i) : null
  const segments: Segment[] = msg.endNote ? [{ kind: 'novel', text: END_NOTE }] : buildSegments(BLOCKS[i], i, mode)

  // 假思考 dots 阶段(仅动画消息)
  useEffect(() => {
    if (!msg.animate) return
    const t = setTimeout(() => setPhase('show'), thinkDelayMs(i))
    return () => clearTimeout(t)
  }, [msg.animate, i])

  // 进入 show 后铺正文:动画=打字机流,非动画=一次铺出
  useEffect(() => {
    if (phase !== 'show') return
    const body = bodyRef.current
    if (!body) return
    body.innerHTML = ''
    if (msg.animate) {
      return streamSegments(body, segments, () => setTyping(false), onScroll)
    }
    buildInstant(body, segments)
    onScroll()
    return
    // segments 由 mode 派生;切换排版时整条消息以新 id 重建(重挂),故此处依赖 phase/mode 已足够
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode])

  if (msg.animate && phase === 'thinking') {
    return (
      <div className="msg msg--assistant">
        <div className="thinking">
          <span />
          <span />
          <span />
        </div>
      </div>
    )
  }

  return (
    <div className="msg msg--assistant">
      {thinking && <ThinkBlock thinking={thinking} />}
      <div className="body" ref={bodyRef} />
      <div className="actions">
        <span className="act" title="复制">
          ⧉
        </span>
        <span className="act" title="重试">
          ↻
        </span>
      </div>
    </div>
  )
}
