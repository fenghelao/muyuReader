// 伪装排版算法的公共类型(PROJECT_PLAN §5)

export type Mode = 'regular' | 'mixed'
export type DisguiseLevel = 'pure' | 'natural' | 'chatty'

export interface Block {
  paragraphs: string[]
}

export interface DiffLine {
  t: '+' | '-'
  text: string
}

/** 一条"渲染单元"里的一个片段 */
export type Segment =
  | { kind: 'novel'; text: string } // 小说正文(衬线体,读者读这个)
  | { kind: 'prose'; text: string } // 英文讲解伪装(无衬线次级色,读者跳过)
  | { kind: 'code'; text: string } // 代码块伪装
  | { kind: 'tool'; name: string; res: string } // 工具调用伪装(⏺ Read/Bash…)
  | { kind: 'edited'; name: string; res: string; diff: DiffLine[] } // 文件编辑伪装(+/- diff)

/** 块级片段(整块弹出,不逐字打字) */
export type BlockSegment = Extract<Segment, { kind: 'code' | 'tool' | 'edited' }>

export interface Thinking {
  lines: string[]
  seconds: number
}
