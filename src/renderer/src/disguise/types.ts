// Public types for deterministic transcript-style composition.

export type Mode = 'regular' | 'mixed'
export type DisguiseLevel = 'pure' | 'natural' | 'chatty'

export interface Block {
  paragraphs: string[]
}

/** 一条"渲染单元"里的一个片段 */
export type Segment =
  // 小说正文(衬线体,读者读这个)
  | { kind: 'novel'; text: string }
  // Collapsed transcript action row.
  | { kind: 'action'; summary: string; detail?: string[] }

/** 块级片段(整块弹出,不逐字打字) */
export type BlockSegment = Extract<Segment, { kind: 'action' }>

export interface Thinking {
  lines: string[]
  seconds: number
}
