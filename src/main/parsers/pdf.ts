import { readFileSync } from 'fs'
import { basename } from 'path'
import type { ParseResult } from './types'
import { pseudoChapters, totalChars } from './util'

/**
 * PDF 文字层抽取(§7.2)。legacy build 可在 Node 无 DOM 跑;
 * 用变量路径动态 import,避免 CJS/ESM 与 TS 子路径类型解析冲突。
 * 简单行聚类(按 y 分组)= MVP;复杂多栏版式属迭代。扫描版无文字层直接降级提示。
 */
export async function parsePdf(filePath: string): Promise<ParseResult> {
  const modPath = 'pdfjs-dist/legacy/build/pdf.mjs'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjs: any = await import(modPath)
  const data = new Uint8Array(readFileSync(filePath))
  const doc = await pdfjs.getDocument({ data, isEvalSupported: false, useSystemFonts: true }).promise

  const pages: string[] = []
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p)
    const content = await page.getTextContent()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (content.items as any[]).filter((it) => typeof it.str === 'string')
    let lastY: number | null = null
    let line = ''
    const lines: string[] = []
    for (const it of items) {
      const y = it.transform[5] as number
      if (lastY !== null && Math.abs(y - lastY) > 3) {
        if (line.trim()) lines.push(line.trim())
        line = ''
      }
      line += it.str
      lastY = y
    }
    if (line.trim()) lines.push(line.trim())
    pages.push(lines.join('\n'))
    await page.cleanup()
  }

  const text = pages.join('\n\n').trim()
  if (!text) return { error: '这个 PDF 看起来是扫描件,没有可读的文字层。' }
  const chapters = pseudoChapters(text)
  return {
    title: basename(filePath).replace(/\.pdf$/i, ''),
    format: 'pdf',
    chapters,
    totalChars: totalChars(chapters)
  }
}
