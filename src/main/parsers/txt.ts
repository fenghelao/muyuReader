import { readFileSync } from 'fs'
import { basename } from 'path'
import jschardet from 'jschardet'
import iconv from 'iconv-lite'
import type { Chapter, ParsedBook } from './types'
import { pseudoChapters, totalChars } from './util'

// 中文网文章节标记(§7.2:^ 配 m 按行锚定,覆盖全角空格/缩进)
const CHAPTER_RE =
  /^[ \t　]*(?:第[零〇一二三四五六七八九十百千万\d]{1,9}[章节回卷篇]|楔子|序章?|引子|番外|后记|尾声|Chapter\s+\d+)[ \t　]*.{0,40}$/gm

/** 编码探测:BOM 优先,否则 jschardet 采样 64KB,GB 系归一到 GB18030 超集 */
function decode(buf: Buffer): string {
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) return buf.subarray(3).toString('utf8')
  if (buf[0] === 0xff && buf[1] === 0xfe) return iconv.decode(buf, 'utf16le')
  if (buf[0] === 0xfe && buf[1] === 0xff) return iconv.decode(buf, 'utf16be')
  const sample = buf.subarray(0, 64 * 1024)
  const res = jschardet.detect(sample)
  let enc = (res.encoding || 'GB18030').toLowerCase()
  if (enc.startsWith('gb') || enc === 'gbk' || enc === 'gb2312') enc = 'gb18030'
  return iconv.decode(buf, iconv.encodingExists(enc) ? enc : 'gb18030')
}

export async function parseTxt(filePath: string): Promise<ParsedBook> {
  const text = decode(readFileSync(filePath)).replace(/\r\n/g, '\n')
  const matches = [...text.matchAll(CHAPTER_RE)]
  let chapters: Chapter[]
  if (matches.length >= 2) {
    chapters = matches.map((m, i) => {
      const headEnd = m.index! + m[0].length
      const end = i + 1 < matches.length ? matches[i + 1].index! : text.length
      return { index: i, title: m[0].trim(), text: text.slice(headEnd, end).trim() }
    })
  } else {
    chapters = pseudoChapters(text)
  }
  if (!chapters.length) chapters = [{ index: 0, title: '正文', text: text.trim() }]
  return {
    title: basename(filePath).replace(/\.txt$/i, ''),
    format: 'txt',
    chapters,
    totalChars: totalChars(chapters)
  }
}
