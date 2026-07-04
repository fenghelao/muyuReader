import { create } from 'zustand'
import { BLOCKS, HISTORY, SAMPLE_BOOKS } from './disguise/content'
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
  fileHash?: string
  savedBlockIndex?: number | null
  chapters: { text: string }[]
}

export interface ShelfBook {
  id: string
  name: string
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
  books: ShelfBook[]
  activeBookId: string
  activeBookHash: string | null
  blocks: Block[]
  blockIndex: number
  messages: Message[]
  typing: boolean
  bossOn: boolean
  libraryHydrated: boolean

  toggleMode: () => void
  toggleTheme: () => void
  bumpFont: (delta: number) => void
  setTyping: (v: boolean) => void
  toggleBoss: () => void
  setBoss: (v: boolean) => void
  setActive: (id: string) => void
  rename: (id: string, name: string) => void
  deleteBook: (id: string) => void
  relocateBook: (id: string) => void
  advance: () => void
  retreat: () => void
  loadBook: (book: LoadedBook) => void
  hydrateLibrary: () => Promise<void>
  showError: (text: string) => void
}

function clampProgress(saved: number | null | undefined, total: number): number {
  const fallback = Math.min(HISTORY, total)
  if (saved == null) return fallback
  if (!Number.isFinite(saved)) return fallback
  return Math.min(total, Math.max(0, Math.floor(saved)))
}

function saveProgress(fileHash: string | null, blockIndex: number): void {
  if (!fileHash) return
  void window.api?.saveProgress?.(fileHash, blockIndex)
}

function promoteBook(books: ShelfBook[], id: string): ShelfBook[] {
  const book = books.find((candidate) => candidate.id === id)
  if (!book) return books
  return [book, ...books.filter((candidate) => candidate.id !== id)]
}

export const useStore = create<State>((set, get) => ({
  mode: 'mixed',
  theme: initialTheme(),
  readerFont: initialFont(),
  books: SAMPLE_BOOKS,
  activeBookId: SAMPLE_BOOKS[0].id,
  activeBookHash: null,
  blocks: BLOCKS,
  blockIndex: HISTORY,
  messages: backfill(HISTORY),
  typing: false,
  bossOn: false,
  libraryHydrated: false,

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
  toggleBoss: () => {
    if (window.api?.toggleBoss) {
      void window.api.toggleBoss().then((bossOn) => set({ bossOn }))
      return
    }
    set({ bossOn: !get().bossOn })
  },
  setBoss: (v) => {
    if (window.api?.setBoss) {
      void window.api.setBoss(v).then((bossOn) => set({ bossOn }))
      return
    }
    set({ bossOn: v })
  },
  setActive: (id) => {
    if (get().typing) return
    set({ activeBookId: id, books: promoteBook(get().books, id) })
    if (!window.api?.loadBook) return
    void window.api.loadBook(id).then((res) => {
      if (!res) return
      if ('error' in res) {
        get().showError(res.error)
        return
      }
      get().loadBook(res)
    })
  },
  rename: (id, name) => {
    const clean = name.trim()
    if (!clean) return
    set({ books: get().books.map((b) => (b.id === id ? { ...b, name: clean } : b)) })
    void window.api?.renameBook?.(id, clean).then((state) => {
      if (state?.books?.length) set({ books: state.books, activeBookId: state.activeBookId ?? get().activeBookId })
    })
  },
  deleteBook: (id) => {
    if (get().typing) return
    if (!window.api?.deleteBook) {
      const books = get().books.filter((b) => b.id !== id)
      set({ books })
      return
    }
    const wasActive = id === get().activeBookId
    void window.api.deleteBook(id).then(async (state) => {
      if (!state.books.length) {
        set({
          books: SAMPLE_BOOKS,
          activeBookId: SAMPLE_BOOKS[0].id,
          activeBookHash: null,
          blocks: BLOCKS,
          blockIndex: HISTORY,
          messages: backfill(HISTORY),
          typing: false
        })
        return
      }
      set({ books: state.books, activeBookId: state.activeBookId ?? state.books[0].id })
      if (!wasActive) return
      const nextId = state.activeBookId ?? state.books[0].id
      const res = await window.api?.loadBook?.(nextId)
      if (!res) return
      if ('error' in res) {
        get().showError(res.error)
        return
      }
      get().loadBook(res)
    })
  },
  relocateBook: (id) => {
    if (get().typing || !window.api?.relocateBook) return
    void window.api.relocateBook(id).then(async (res) => {
      if (!res) return
      if ('error' in res) {
        get().showError(res.error)
        return
      }
      const library = await window.api?.getLibrary?.()
      if (library?.books.length) {
        set({ books: library.books, activeBookId: library.activeBookId ?? res.fileHash })
      }
      get().loadBook(res)
    })
  },

  advance: () => {
    const s = get()
    if (s.typing) return
    const i = s.blockIndex
    const user: Message = { id: ++msgId, role: 'user', text: qFor(i) }
    if (i >= s.blocks.length) {
      const end: Message = { id: ++msgId, role: 'assistant', endNote: true, animate: true }
      set({ messages: [...s.messages, user, end], typing: true })
      saveProgress(s.activeBookHash, s.blocks.length)
    } else {
      const asst: Message = { id: ++msgId, role: 'assistant', blockIndex: i, animate: true }
      set({ messages: [...s.messages, user, asst], blockIndex: i + 1, typing: true })
      saveProgress(s.activeBookHash, i + 1)
    }
  },

  retreat: () => {
    const s = get()
    if (s.typing || s.blockIndex <= 0) return
    const nextIndex = s.blockIndex - 1
    set({
      blockIndex: nextIndex,
      messages: backfill(nextIndex),
      typing: false
    })
    saveProgress(s.activeBookHash, nextIndex)
  },

  // M2:导入真书 → 切块 → 新建一个伪装会话(名字仍是 General coding session)并载入
  loadBook: (book) => {
    const blocks = chunkBook(book.chapters)
    const h = clampProgress(book.savedBlockIndex, blocks.length)
    const id = book.fileHash ?? 'bk' + ++bookSeq
    const existing = get().books.find((b) => b.id === id)
    set({
      blocks,
      books: existing ? promoteBook(get().books, id) : [{ id, name: 'General coding session' }, ...get().books],
      activeBookId: id,
      activeBookHash: book.fileHash ?? null,
      blockIndex: h,
      messages: backfill(h),
      typing: false,
      bossOn: false
    })
    saveProgress(book.fileHash ?? null, h)
  },

  hydrateLibrary: async () => {
    if (get().libraryHydrated || !window.api?.getLibrary) return
    set({ libraryHydrated: true })
    const library = await window.api.getLibrary()
    if (!library.books.length) return
    set({
      books: library.books,
      activeBookId: library.activeBookId ?? library.books[0].id
    })
    const id = library.activeBookId ?? library.books[0].id
    const res = await window.api.loadBook?.(id)
    if (!res) return
    if ('error' in res) {
      get().showError(res.error)
      return
    }
    get().loadBook(res)
  },

  // §13:解析失败 → 伪装成一条 Claude 助手消息,不弹系统框
  showError: (text) => set({ messages: [...get().messages, { id: ++msgId, role: 'assistant', errorText: text }] })
}))
