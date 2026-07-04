import { BLOCKS, CAMO_POOL, CODE_POOL, EDIT_POOL, FRAMING, QUESTIONS, THINK_POOL, TOOL_POOL } from './content'
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

// 伪装段类型确定性轮换(禁 Math.random,保证续读/重开一致),偏重 tool / edited
const CAMO_PATTERN = ['tool', 'prose', 'edited', 'tool', 'code', 'prose', 'edited', 'tool'] as const

/** 第 i 块内第 j 段正文之后跟的伪装段(确定性) */
export function pickCamoSeg(i: number, j: number): Segment {
  const p = i * 3 + j
  const kind = CAMO_PATTERN[p % CAMO_PATTERN.length]
  if (kind === 'prose') return { kind: 'prose', text: CAMO_POOL[(i * 2 + j) % CAMO_POOL.length] }
  if (kind === 'code') return { kind: 'code', text: CODE_POOL[(i + j) % CODE_POOL.length] }
  if (kind === 'tool') return { kind: 'tool', ...TOOL_POOL[(i * 2 + j) % TOOL_POOL.length] }
  return { kind: 'edited', ...EDIT_POOL[(i + j) % EDIT_POOL.length] }
}

/** 把一块正文按当前排版模式编排成片段序列 */
export function buildSegments(block: Block, i: number, mode: Mode): Segment[] {
  if (mode === 'regular') return block.paragraphs.map((t) => ({ kind: 'novel', text: t }))
  const out: Segment[] = []
  block.paragraphs.forEach((t, j) => {
    out.push({ kind: 'novel', text: t })
    out.push(pickCamoSeg(i, j))
  })
  return out
}
