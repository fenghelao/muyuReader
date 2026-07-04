import type { BlockSegment, Segment } from './types'

// 标点后停顿(§5.5)
const PUNC = /[，。！？；：、…—“”·.!?,;]/

function prefersReduced(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 渲染一个块级片段(code / tool / edited)为 DOM —— 像 Claude 一样整块弹出 */
export function renderBlockEl(seg: BlockSegment): HTMLElement {
  if (seg.kind === 'code') {
    const pre = document.createElement('pre')
    pre.className = 'code'
    pre.textContent = seg.text
    return pre
  }
  const wrap = document.createElement('div')
  wrap.className = 'tool'
  const line = document.createElement('div')
  line.className = 'tline'
  const dot = document.createElement('span')
  dot.className = 'dot'
  dot.textContent = '⏺'
  const nm = document.createElement('span')
  nm.className = 'tname'
  nm.textContent = seg.name
  line.append(dot, nm)
  wrap.appendChild(line)
  const res = document.createElement('div')
  res.className = 'tres'
  res.textContent = '⎿ ' + seg.res
  wrap.appendChild(res)
  if (seg.kind === 'edited') {
    const d = document.createElement('div')
    d.className = 'diff'
    for (const ln of seg.diff) {
      const r = document.createElement('div')
      r.className = ln.t === '+' ? 'add' : 'del'
      r.textContent = ln.t + ' ' + ln.text
      d.appendChild(r)
    }
    wrap.appendChild(d)
  }
  return wrap
}

/** 一次性铺出全部片段(历史回填 / 切换排版重渲染) */
export function buildInstant(body: HTMLElement, segs: Segment[]): void {
  for (const s of segs) {
    if (s.kind === 'novel' || s.kind === 'prose') {
      const p = document.createElement('p')
      if (s.kind === 'prose') p.className = 'camo'
      p.textContent = s.text
      body.appendChild(p)
    } else {
      body.appendChild(renderBlockEl(s))
    }
  }
}

/**
 * 顺序流:文本段逐字打字,块级段(tool/edited/code)整块弹出。
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
    if (s.kind === 'novel' || s.kind === 'prose') {
      const p = document.createElement('p')
      if (s.kind === 'prose') p.className = 'camo'
      body.appendChild(p)
      typeInto(p, s.text, next)
    } else {
      body.appendChild(renderBlockEl(s))
      onTick?.()
      timer = setTimeout(next, reduce ? 0 : 160)
    }
  }

  next()
  return () => {
    cancelled = true
    cancelAnimationFrame(raf)
    if (timer) clearTimeout(timer)
  }
}
