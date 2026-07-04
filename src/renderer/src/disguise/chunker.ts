import type { Block } from './types'

// §5.3 切块:段边界优先,超长段按句拆,无标点硬切。目标 ~220–420 字/块。
const TARGET_MIN = 220
const TARGET_MAX = 420
const HARD_MAX = 520

/** 把一段章节纯文本切成块(每块 2~5 段) */
export function chunkText(text: string): Block[] {
  // 网文段落分隔既可能是 \n\n 也可能是单 \n,统一按 \n+ 切;trim 去掉全角缩进
  const paras = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const blocks: Block[] = []
  let buf: string[] = []
  let chars = 0
  const flush = (): void => {
    if (buf.length) {
      blocks.push({ paragraphs: buf })
      buf = []
      chars = 0
    }
  }
  for (const para of paras) {
    const pieces = para.length > TARGET_MAX ? splitLong(para) : [para]
    for (const piece of pieces) {
      buf.push(piece)
      chars += piece.length
      if (chars >= TARGET_MAX || buf.length >= 5 || (chars >= TARGET_MIN && buf.length >= 2)) flush()
    }
  }
  flush()
  return blocks
}

/** 超长段:先按句号边界拆,仍超长再硬切 */
function splitLong(para: string): string[] {
  const sentences = para.split(/(?<=[。！？…!?])/).filter(Boolean)
  const out: string[] = []
  let cur = ''
  for (const s of sentences) {
    if (cur.length + s.length > HARD_MAX && cur) {
      out.push(cur)
      cur = ''
    }
    cur += s
    if (cur.length >= TARGET_MIN) {
      out.push(cur)
      cur = ''
    }
  }
  if (cur) out.push(cur)
  return out.flatMap((s) => (s.length > HARD_MAX ? hardCut(s) : [s]))
}

function hardCut(s: string): string[] {
  const out: string[] = []
  for (let i = 0; i < s.length; i += HARD_MAX) out.push(s.slice(i, i + HARD_MAX))
  return out
}

/** 整本书 → 块序列(章节顺序拼接;章节标题不注入正文,§5.8) */
export function chunkBook(chapters: { text: string }[]): Block[] {
  const out: Block[] = []
  for (const ch of chapters) out.push(...chunkText(ch.text))
  return out.length ? out : [{ paragraphs: ['（这本书没有可读的正文。）'] }]
}
