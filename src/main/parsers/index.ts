import { extname } from 'path'
import type { ParseResult } from './types'
import { parseTxt } from './txt'
import { parseEpub } from './epub'
import { parsePdf } from './pdf'

// §13:错误一律以友好文案回传,渲染层伪装成 Claude 助手消息,绝不弹系统框
export async function openAndParse(filePath: string): Promise<ParseResult> {
  const ext = extname(filePath).toLowerCase()
  try {
    if (ext === '.txt') return await parseTxt(filePath)
    if (ext === '.epub') return await parseEpub(filePath)
    if (ext === '.pdf') return await parsePdf(filePath)
    return { error: `暂不支持 ${ext || '这个'} 格式,试试 TXT / EPUB / PDF 吧。` }
  } catch (e) {
    console.error('[parse]', e)
    return { error: '这个文件我读不太出来,可能已损坏。' }
  }
}

export type { ParseResult, ParsedBook, Chapter } from './types'
