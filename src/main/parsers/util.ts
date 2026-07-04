import type { Chapter } from './types'

/** 无章节结构时,按 ~size 字切成伪章节(§7.2:避免几 MB 一次性渲染卡死) */
export function pseudoChapters(text: string, size = 3000): Chapter[] {
  const clean = text.replace(/\r\n/g, '\n').trim()
  if (!clean) return []
  const chapters: Chapter[] = []
  for (let i = 0, idx = 0; i < clean.length; i += size, idx++) {
    chapters.push({ index: idx, title: `第 ${idx + 1} 节`, text: clean.slice(i, i + size).trim() })
  }
  return chapters
}

export function totalChars(chapters: Chapter[]): number {
  return chapters.reduce((n, c) => n + c.text.length, 0)
}
