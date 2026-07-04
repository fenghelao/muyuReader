import { useCallback, useEffect, useRef } from 'react'
import { useStore } from '../store'
import AssistantMessage from './AssistantMessage'
import UserBubble from './UserBubble'

export default function Thread() {
  const messages = useStore((s) => s.messages)
  const ref = useRef<HTMLDivElement>(null)

  const scroll = useCallback(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    scroll()
  }, [messages, scroll])

  return (
    <div className="thread" ref={ref}>
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
