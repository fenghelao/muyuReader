import { access, readFile } from 'fs/promises'
import { createHash } from 'crypto'
import Store from 'electron-store'
import { openAndParse } from '../parsers'
import type { ParsedBook, ParseResult } from '../parsers'

export const CHUNKER_VERSION = 1

export interface LibraryItem {
  id: string
  name: string
  filePath: string
  sourceTitle: string
  format: ParsedBook['format']
  totalChars: number
  importedAt: number
  updatedAt: number
}

export interface ReadingPosition {
  fileHash: string
  chunkerVersion: number
  blockIndex: number
  charStart: number
  updatedAt: number
}

interface LibrarySchema {
  items: LibraryItem[]
  activeBookId?: string
  progress: Record<string, ReadingPosition>
}

export interface ShelfBook {
  id: string
  name: string
}

export interface LibraryState {
  books: ShelfBook[]
  activeBookId?: string
}

export type StoredBookResult =
  | (ParsedBook & {
      fileHash: string
      savedBlockIndex: number | null
    })
  | { error: string }

const store = new Store<LibrarySchema>({
  name: 'library',
  defaults: {
    items: [],
    progress: {}
  }
})

function now(): number {
  return Date.now()
}

async function hashFile(filePath: string): Promise<string> {
  const data = await readFile(filePath)
  return createHash('sha256').update(data).digest('hex')
}

function shelf(item: LibraryItem): ShelfBook {
  return { id: item.id, name: item.name }
}

function getItems(): LibraryItem[] {
  return store.get('items', [])
}

function setItems(items: LibraryItem[]): void {
  store.set('items', items)
}

function touchItem(bookId: string): void {
  const items = getItems()
  const item = items.find((candidate) => candidate.id === bookId)
  if (!item) return
  const next = { ...item, updatedAt: now() }
  setItems([next, ...items.filter((candidate) => candidate.id !== bookId)])
}

function getProgress(fileHash: string): ReadingPosition | undefined {
  return store.get(`progress.${fileHash}` as const)
}

function moveProgress(fromId: string, toId: string): void {
  if (fromId === toId) return
  const progress = { ...store.get('progress', {}) }
  const current = progress[fromId]
  if (!current) return
  progress[toId] = { ...current, fileHash: toId, updatedAt: now() }
  delete progress[fromId]
  store.set('progress', progress)
}

function withSavedPosition(book: ParsedBook, fileHash: string): StoredBookResult {
  const pos = getProgress(fileHash)
  return {
    ...book,
    fileHash,
    savedBlockIndex: pos?.chunkerVersion === CHUNKER_VERSION ? pos.blockIndex : null
  }
}

function rememberItem(fileHash: string, filePath: string, book: ParsedBook): void {
  const items = getItems()
  const existing = items.find((item) => item.id === fileHash)
  const timestamp = now()
  const next: LibraryItem = {
    id: fileHash,
    name: existing?.name ?? 'General coding session',
    filePath,
    sourceTitle: book.title,
    format: book.format,
    totalChars: book.totalChars,
    importedAt: existing?.importedAt ?? timestamp,
    updatedAt: timestamp
  }
  setItems([next, ...items.filter((item) => item.id !== fileHash)])
  store.set('activeBookId', fileHash)
}

export function getLibraryState(): LibraryState {
  return {
    books: getItems().map(shelf),
    activeBookId: store.get('activeBookId')
  }
}

export async function importBook(filePath: string): Promise<StoredBookResult> {
  const parsed = await openAndParse(filePath)
  if ('error' in parsed) return parsed
  try {
    const fileHash = await hashFile(filePath)
    rememberItem(fileHash, filePath, parsed)
    return withSavedPosition(parsed, fileHash)
  } catch {
    return { error: 'I could not save a local record for this file after opening it.' }
  }
}

export async function loadBook(bookId: string): Promise<StoredBookResult> {
  const item = getItems().find((candidate) => candidate.id === bookId)
  if (!item) return { error: 'I could not find this conversation in the local library.' }
  try {
    await access(item.filePath)
  } catch {
    return { error: 'I can no longer access this local file. Use Relocate from the Recents menu to reconnect it.' }
  }
  const parsed: ParseResult = await openAndParse(item.filePath)
  if ('error' in parsed) return parsed
  touchItem(bookId)
  store.set('activeBookId', bookId)
  return withSavedPosition(parsed, bookId)
}

export function saveProgress(fileHash: string, blockIndex: number): void {
  const index = Math.max(0, Math.floor(blockIndex))
  store.set(`progress.${fileHash}` as const, {
    fileHash,
    chunkerVersion: CHUNKER_VERSION,
    blockIndex: index,
    charStart: 0,
    updatedAt: now()
  })
  store.set('activeBookId', fileHash)
  touchItem(fileHash)
}

export function renameBook(bookId: string, name: string): LibraryState {
  const clean = name.trim()
  if (!clean) return getLibraryState()
  const items = getItems().map((item) => (item.id === bookId ? { ...item, name: clean, updatedAt: now() } : item))
  setItems(items)
  return getLibraryState()
}

export function deleteBook(bookId: string): LibraryState {
  const items = getItems().filter((item) => item.id !== bookId)
  const progress = { ...store.get('progress', {}) }
  delete progress[bookId]
  setItems(items)
  store.set('progress', progress)
  if (store.get('activeBookId') === bookId) {
    if (items[0]) store.set('activeBookId', items[0].id)
    else store.delete('activeBookId')
  }
  return getLibraryState()
}

export async function relocateBook(bookId: string, filePath: string): Promise<StoredBookResult> {
  const current = getItems().find((item) => item.id === bookId)
  if (!current) return { error: 'I could not find this conversation in the local library.' }
  const parsed = await openAndParse(filePath)
  if ('error' in parsed) return parsed

  let fileHash: string
  try {
    fileHash = await hashFile(filePath)
  } catch {
    return { error: 'I could not access the replacement file after selecting it.' }
  }

  const items = getItems()
  const duplicate = items.find((item) => item.id === fileHash && item.id !== bookId)
  const updated: LibraryItem = {
    id: fileHash,
    name: duplicate?.name ?? current.name,
    filePath,
    sourceTitle: parsed.title,
    format: parsed.format,
    totalChars: parsed.totalChars,
    importedAt: duplicate?.importedAt ?? current.importedAt,
    updatedAt: now()
  }

  moveProgress(bookId, fileHash)
  setItems([updated, ...items.filter((item) => item.id !== bookId && item.id !== fileHash)])
  store.set('activeBookId', fileHash)
  return withSavedPosition(parsed, fileHash)
}
