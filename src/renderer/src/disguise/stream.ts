import type { BlockSegment, Segment } from './types'

// 标点后停顿(§5.5)
const PUNC = /[，。！？；：、…—“”·.!?,;]/

function prefersReduced(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Render one block-level transcript segment.
 * 默认折叠只占一行灰字;有 detail 时点击展开,细节里 +/- 行着色。
 */
export function renderBlockEl(seg: BlockSegment): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'action collapsed'

  const head = document.createElement('div')
  head.className = 'action-head'
  const label = document.createElement('span')
  label.className = 'action-summary'
  label.textContent = seg.summary
  const chev = document.createElement('span')
  chev.className = 'action-chev'
  chev.textContent = '›'
  head.append(label, chev)
  wrap.appendChild(head)

  if (seg.detail && seg.detail.length) {
    const d = document.createElement('div')
    d.className = 'action-detail'
    for (const ln of seg.detail) {
      const r = document.createElement('div')
      if (ln.startsWith('+')) r.className = 'add'
      else if (ln.startsWith('-')) r.className = 'del'
      r.textContent = ln
      d.appendChild(r)
    }
    wrap.appendChild(d)
    head.style.cursor = 'pointer'
    head.addEventListener('click', () => wrap.classList.toggle('collapsed'))
  } else {
    chev.style.visibility = 'hidden'
  }
  return wrap
}

/** 一次性铺出全部片段(历史回填 / 切换排版重渲染) */
export function buildInstant(body: HTMLElement, segs: Segment[]): void {
  for (const s of segs) {
    if (s.kind === 'novel') {
      const p = document.createElement('p')
      p.textContent = s.text
      body.appendChild(p)
    } else {
      body.appendChild(renderBlockEl(s))
    }
  }
}

/**
 * 顺序流:正文段逐字打字,action 摘要行整块弹出。
 * 返回取消函数(组件卸载 / React StrictMode 清理时调用)。
 */
export function streamSegments(
  body: HTMLElement,
  segs: Segment[],
  onDone?: () => void,
  onTick?: () => void
): () => void {
  const reduce = prefersReduced()
  let cancelled = false
  let raf = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let k = 0

  function typeInto(node: HTMLElement, text: string, cb: () => void): void {
    if (reduce) {
      node.textContent = text
      cb()
      return
    }
    const cursor = document.createElement('span')
    cursor.className = 'cursor'
    cursor.textContent = '▍'
    const chars = Array.from(text)
    let ci = 0
    let last = performance.now()
    let acc = 0
    let delay = 32
    function step(now: number): void {
      if (cancelled) {
        cursor.remove()
        return
      }
      acc += now - last
      last = now
      while (acc >= delay) {
        acc -= delay
        if (ci >= chars.length) {
          cursor.remove()
          cb()
          return
        }
        node.textContent = chars.slice(0, ci + 1).join('')
        node.appendChild(cursor)
        const ch = chars[ci]
        ci++
        delay = PUNC.test(ch) ? 190 : 24 + ((ci * 13) % 26)
        onTick?.()
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
  }

  function next(): void {
    if (cancelled) return
    if (k >= segs.length) {
      onDone?.()
      return
    }
    const s = segs[k++]
    if (s.kind === 'novel') {
      const p = document.createElement('p')
      body.appendChild(p)
      typeInto(p, s.text, next)
    } else {
      body.appendChild(renderBlockEl(s))
      onTick?.()
      timer = setTimeout(next, reduce ? 0 : 140)
    }
  }

  next()
  return () => {
    cancelled = true
    cancelAnimationFrame(raf)
    if (timer) clearTimeout(timer)
  }
}
