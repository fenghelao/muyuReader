import { useEffect, useMemo, useRef } from 'react'
import type { WheelEvent } from 'react'
import { useStore } from '../store'
import type { ReaderBackground } from '../store'

const BACKGROUNDS: { id: ReaderBackground; label: string }[] = [
  { id: 'paper', label: 'Paper' },
  { id: 'white', label: 'White' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'dark', label: 'Dark' }
]

export default function ReaderView() {
  const books = useStore((s) => s.books)
  const activeBookId = useStore((s) => s.activeBookId)
  const blocks = useStore((s) => s.blocks)
  const blockIndex = useStore((s) => s.blockIndex)
  const readerFont = useStore((s) => s.readerFont)
  const readerBackground = useStore((s) => s.readerBackground)
  const setReaderBackground = useStore((s) => s.setReaderBackground)
  const bumpFont = useStore((s) => s.bumpFont)
  const readerStep = useStore((s) => s.readerStep)
  const setProgress = useStore((s) => s.setProgress)
  const active = books.find((b) => b.id === activeBookId)
  const pageRef = useRef<HTMLElement>(null)
  const wheelLock = useRef(0)

  const currentIndex = blocks.length ? Math.min(blocks.length - 1, Math.max(0, blockIndex)) : 0
  const current = blocks[currentIndex]
  const percent = blocks.length ? Math.round((blockIndex / blocks.length) * 100) : 0
  const preview = useMemo(() => current?.paragraphs ?? [], [current])

  useEffect(() => {
    if (pageRef.current) pageRef.current.scrollTop = 0
  }, [blockIndex])

  const onWheel = (e: WheelEvent<HTMLElement>): void => {
    if (Math.abs(e.deltaY) < 24) return
    const el = pageRef.current
    if (!el) return
    const now = performance.now()
    if (now - wheelLock.current < 360) return
    const atTop = el.scrollTop <= 2
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 2
    if (e.deltaY > 0 && atBottom) {
      wheelLock.current = now
      e.preventDefault()
      readerStep(1)
    } else if (e.deltaY < 0 && atTop) {
      wheelLock.current = now
      e.preventDefault()
      readerStep(-1)
    }
  }

  return (
    <section className={'reader-view reader-bg-' + readerBackground}>
      <header className="reader-toolbar">
        <div className="reader-title">
          <strong>{active?.name ?? 'Reading'}</strong>
          <span>
            {Math.min(blockIndex, blocks.length)} / {blocks.length} - {percent}%
          </span>
        </div>
        <div className="reader-controls">
          <button onClick={() => readerStep(-1)} disabled={blockIndex <= 0}>
            Previous
          </button>
          <button onClick={() => readerStep(1)} disabled={blockIndex >= blocks.length}>
            Next
          </button>
          <button onClick={() => bumpFont(-1)}>A-</button>
          <button onClick={() => bumpFont(1)}>A+</button>
          <select value={readerBackground} onChange={(e) => setReaderBackground(e.currentTarget.value as ReaderBackground)}>
            {BACKGROUNDS.map((bg) => (
              <option key={bg.id} value={bg.id}>
                {bg.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="reader-progress">
        <input
          type="range"
          min={0}
          max={blocks.length}
          value={Math.min(blockIndex, blocks.length)}
          onChange={(e) => setProgress(Number(e.currentTarget.value))}
        />
      </div>

      <article className="reader-page" ref={pageRef} onWheel={onWheel} style={{ fontSize: readerFont }}>
        {preview.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </article>
    </section>
  )
}
