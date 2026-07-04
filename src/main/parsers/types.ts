// 解析器统一输出(纯 JSON,经 IPC 回传渲染层)
export interface Chapter {
  index: number
  title: string
  text: string
}
export interface ParsedBook {
  title: string
  author?: string
  format: 'txt' | 'epub' | 'pdf'
  chapters: Chapter[]
  totalChars: number
}
export type ParseResult = ParsedBook | { error: string }
