import { ACTION_POOL, BLOCKS, FRAMING, QUESTIONS, THINK_POOL } from './content'
import type { Block, Mode, Segment, Thinking } from './types'

/** 第 i 块前的伪问题(i===0 用开场框架问题),确定性 */
export function qFor(i: number): string {
  return i === 0 ? FRAMING : QUESTIONS[(i - 1) % QUESTIONS.length]
}

/** 第 i 块的假思考摘要(Thought for Ns),确定性 */
export function buildThinking(i: number): Thinking {
  return {
    lines: [THINK_POOL[i % THINK_POOL.length], THINK_POOL[(i + 3) % THINK_POOL.length]],
    seconds: 2 + ((i * 3) % 7)
  }
}

/** 假思考停顿时长,确定性(§5.5) */
export function thinkDelayMs(i: number): number {
  return 120 + ((i * 97) % 280)
}

/** 第 i 块内第 j 段正文之后跟的 action 摘要行(确定性,禁 Math.random) */
function pickAction(i: number, j: number): Segment {
  const a = ACTION_POOL[(i * 3 + j) % ACTION_POOL.length]
  return { kind: 'action', summary: a.summary, detail: a.detail }
}

/**
 * 把一块正文按当前排版模式编排成片段序列。
 * 混合模式:每段正文后跟一行灰色折叠工具摘要(仿 Claude Code,极易跳过,不挡阅读)。
 */
export function buildSegments(block: Block, i: number, mode: Mode): Segment[] {
  if (mode === 'regular') return block.paragraphs.map((t) => ({ kind: 'novel', text: t }))
  const out: Segment[] = []
  block.paragraphs.forEach((t, j) => {
    out.push({ kind: 'novel', text: t })
    out.push(pickAction(i, j))
  })
  return out
}
