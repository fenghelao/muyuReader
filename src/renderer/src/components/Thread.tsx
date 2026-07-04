import { useCallback, useEffect, useRef } from 'react'
import type { WheelEvent } from 'react'
import { useStore } from '../store'
import AssistantMessage from './AssistantMessage'
import UserBubble from './UserBubble'

export default function Thread() {
  const messages = useStore((s) => s.messages)
  const typing = useStore((s) => s.typing)
  const advance = useStore((s) => s.advance)
  const retreat = useStore((s) => s.retreat)
  const ref = useRef<HTMLDivElement>(null)
  const wheelLock = useRef(0)

  const scroll = useCallback(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    scroll()
  }, [messages, scroll])

  const onWheel = (e: WheelEvent<HTMLDivElement>): void => {
    if (typing || Math.abs(e.deltaY) < 24) return
    const el = ref.current
    if (!el) return
    const now = performance.now()
    if (now - wheelLock.current < 520) return
    const atTop = el.scrollTop <= 2
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 2
    if (e.deltaY > 0 && atBottom) {
      wheelLock.current = now
      e.preventDefault()
      advance()
    } else if (e.deltaY < 0 && atTop) {
      wheelLock.current = now
      e.preventDefault()
      retreat()
    }
  }

  return (
    <div className="thread" ref={ref} onWheel={onWheel}>
      <div className="thread-inner">
        {messages.map((m) =>
          m.role === 'user' ? (
            <UserBubble key={m.id} text={m.text ?? ''} />
          ) : (
            <AssistantMessage key={m.id} msg={m} onScroll={scroll} />
          )
        )}
      </div>
    </div>
  )
}
