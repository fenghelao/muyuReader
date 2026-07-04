import { create } from 'zustand'
import { BLOCK_COUNT, HISTORY, SAMPLE_BOOKS } from './disguise/content'
import type { SampleBook } from './disguise/content'
import { qFor } from './disguise/composer'
import type { Mode } from './disguise/types'

export interface Message {
  id: number
  role: 'user' | 'assistant'
  text?: string
  blockIndex?: number
  animate?: boolean
  endNote?: boolean
}

type Theme = 'light' | 'dark'

let msgId = 0
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
}

export const useStore = create<State>((set, get) => ({
  mode: 'mixed',
  theme: initialTheme(),
  readerFont: initialFont(),
  books: SAMPLE_BOOKS,
  activeBookId: SAMPLE_BOOKS[0].id,
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
    if (i >= BLOCK_COUNT) {
      const end: Message = { id: ++msgId, role: 'assistant', endNote: true, animate: true }
      set({ messages: [...s.messages, user, end], typing: true })
    } else {
      const asst: Message = { id: ++msgId, role: 'assistant', blockIndex: i, animate: true }
      set({ messages: [...s.messages, user, asst], blockIndex: i + 1, typing: true })
    }
  }
}))
