import { create } from 'zustand'
import { BLOCKS, HISTORY, SAMPLE_BOOKS } from './disguise/content'
import type { SampleBook } from './disguise/content'
import { qFor } from './disguise/composer'
import { chunkBook } from './disguise/chunker'
import type { Block, Mode } from './disguise/types'

export interface Message {
  id: number
  role: 'user' | 'assistant'
  text?: string
  blockIndex?: number
  animate?: boolean
  endNote?: boolean
  errorText?: string
}

type Theme = 'light' | 'dark'

/** loadBook 接受的最小书籍形状(与 preload IpcBook 结构兼容) */
export interface LoadedBook {
  title?: string
  chapters: { text: string }[]
}

let msgId = 0
let bookSeq = 0

function backfill(count: number): Message[] {
  const out: Message[] = []
  for (let i = 0; i < count; i++) {
    out.push({ id: ++msgId, role: 'user', text: qFor(i) })
    out.push({ id: ++msgId, role: 'assistant', blockIndex: i, animate: false })
  }
  return out
}

function initialFont(): number {
  try {
    const s = parseInt(localStorage.getItem('moyu.font') ?? '', 10)
    if (!Number.isNaN(s)) return Math.min(24, Math.max(13, s))
  } catch {
    /* ignore */
  }
  return 16
}
function initialTheme(): Theme {
  try {
    const t = localStorage.getItem('moyu.theme')
    if (t === 'light' || t === 'dark') return t
  } catch {
    /* ignore */
  }
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

interface State {
  mode: Mode
  theme: Theme
  readerFont: number
  books: SampleBook[]
  activeBookId: string
  blocks: Block[]
  blockIndex: number
  messages: Message[]
  typing: boolean
  bossOn: boolean

  toggleMode: () => void
  toggleTheme: () => void
  bumpFont: (delta: number) => void
  setTyping: (v: boolean) => void
  toggleBoss: () => void
  setBoss: (v: boolean) => void
  setActive: (id: string) => void
  rename: (id: string, name: string) => void
  advance: () => void
  loadBook: (book: LoadedBook) => void
  showError: (text: string) => void
}

export const useStore = create<State>((set, get) => ({
  mode: 'mixed',
  theme: initialTheme(),
  readerFont: initialFont(),
  books: SAMPLE_BOOKS,
  activeBookId: SAMPLE_BOOKS[0].id,
  blocks: BLOCKS,
  blockIndex: HISTORY,
  messages: backfill(HISTORY),
  typing: false,
  bossOn: false,

  toggleMode: () => {
    if (get().typing) return
    const mode: Mode = get().mode === 'mixed' ? 'regular' : 'mixed'
    set({ mode, messages: backfill(get().blockIndex) })
  },
  toggleTheme: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem('moyu.theme', theme)
    } catch {
      /* ignore */
    }
    set({ theme })
  },
  bumpFont: (delta) => {
    const readerFont = Math.min(24, Math.max(13, get().readerFont + delta))
    try {
      localStorage.setItem('moyu.font', String(readerFont))
    } catch {
      /* ignore */
    }
    set({ readerFont })
  },
  setTyping: (v) => set({ typing: v }),
  toggleBoss: () => set({ bossOn: !get().bossOn }),
  setBoss: (v) => set({ bossOn: v }),
  setActive: (id) => set({ activeBookId: id }),
  rename: (id, name) => set({ books: get().books.map((b) => (b.id === id ? { ...b, name } : b)) }),

  advance: () => {
    const s = get()
    if (s.typing) return
    const i = s.blockIndex
    const user: Message = { id: ++msgId, role: 'user', text: qFor(i) }
    if (i >= s.blocks.length) {
      const end: Message = { id: ++msgId, role: 'assistant', endNote: true, animate: true }
      set({ messages: [...s.messages, user, end], typing: true })
    } else {
      const asst: Message = { id: ++msgId, role: 'assistant', blockIndex: i, animate: true }
      set({ messages: [...s.messages, user, asst], blockIndex: i + 1, typing: true })
    }
  },

  // M2:导入真书 → 切块 → 新建一个伪装会话(名字仍是 General coding session)并载入
  loadBook: (book) => {
    const blocks = chunkBook(book.chapters)
    const h = Math.min(HISTORY, blocks.length)
    const id = 'bk' + ++bookSeq
    set({
      blocks,
      books: [{ id, name: 'General coding session' }, ...get().books],
      activeBookId: id,
      blockIndex: h,
      messages: backfill(h),
      typing: false,
      bossOn: false
    })
  },

  // §13:解析失败 → 伪装成一条 Claude 助手消息,不弹系统框
  showError: (text) => set({ messages: [...get().messages, { id: ++msgId, role: 'assistant', errorText: text }] })
}))
