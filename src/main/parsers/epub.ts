import { basename } from 'path'
import { EPub } from 'epub2'
import { parse as parseHtml } from 'node-html-parser'
import type { Chapter, ParsedBook } from './types'
import { totalChars } from './util'

/** 章节 XHTML → 纯文本(保段落边界);正文一律略过图片(§5.8) */
function htmlToText(html: string): string {
  const root = parseHtml(html)
  const ps = root.querySelectorAll('p')
  if (ps.length) {
    return ps
      .map((p) => p.textContent.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join('\n\n')
  }
  return root.textContent.replace(/\n{3,}/g, '\n\n').trim()
}

export async function parseEpub(filePath: string): Promise<ParsedBook> {
  const epub = await EPub.createAsync(filePath)
  const chapters: Chapter[] = []
  let idx = 0
  // epub.flow = spine(阅读顺序);toc 只做导航,不用来拼正文(§7.2)
  for (const item of epub.flow) {
    if (!item.id) continue
    try {
      const html = await epub.getChapterAsync(item.id)
      const text = htmlToText(html)
      if (text) {
        chapters.push({ index: idx, title: item.title || `第 ${idx + 1} 章`, text })
        idx++
      }
    } catch {
      /* 跳过坏章节 */
    }
  }
  const meta = (epub.metadata || {}) as { title?: string; creator?: string }
  return {
    title: meta.title || basename(filePath).replace(/\.epub$/i, ''),
    author: meta.creator,
    format: 'epub',
    chapters,
    totalChars: totalChars(chapters)
  }
}
