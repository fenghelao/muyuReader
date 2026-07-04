// 伪装排版算法的公共类型(PROJECT_PLAN §5)

export type Mode = 'regular' | 'mixed'
export type DisguiseLevel = 'pure' | 'natural' | 'chatty'

export interface Block {
  paragraphs: string[]
}

/** 一条"渲染单元"里的一个片段 */
export type Segment =
  // 小说正文(衬线体,读者读这个)
  | { kind: 'novel'; text: string }
  // 伪装:仿 Claude Code transcript 的灰色折叠工具摘要行(读者一眼跳过,不挡阅读)
  | { kind: 'action'; summary: string; detail?: string[] }

/** 块级片段(整块弹出,不逐字打字) */
export type BlockSegment = Extract<Segment, { kind: 'action' }>

export interface Thinking {
  lines: string[]
  seconds: number
}
