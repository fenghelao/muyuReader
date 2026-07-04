import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store'
import { Chevron, Dots, Plus, SearchIcon, Sparkle } from './icons'

export default function Sidebar() {
  const books = useStore((s) => s.books)
  const activeBookId = useStore((s) => s.activeBookId)
  const setActive = useStore((s) => s.setActive)
  const rename = useStore((s) => s.rename)
  const deleteBook = useStore((s) => s.deleteBook)
  const relocateBook = useStore((s) => s.relocateBook)
  const loadBook = useStore((s) => s.loadBook)
  const showError = useStore((s) => s.showError)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  const visibleBooks = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return books
    return books.filter((b) => b.name.toLowerCase().includes(q))
  }, [books, query])

  useEffect(() => {
    if (!menuId) return
    const close = (): void => {
      setMenuId(null)
      setConfirmDeleteId(null)
    }
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('click', close)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuId])

  async function onNewChat(): Promise<void> {
    const res = await window.api?.openBook?.()
    if (!res) return
    if ('error' in res) {
      showError(res.error)
      return
    }
    loadBook(res)
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <Sparkle className="brand-logo" />
        <span className="brand-name">Claude</span>
      </div>
      <button className="side-btn" onClick={onNewChat}>
        <Plus className="icon icon-sm" />
        New chat
      </button>
      <div className="search">
        <SearchIcon className="icon icon-sm" />
        <input value={query} placeholder="Search chats..." onChange={(e) => setQuery(e.currentTarget.value)} />
      </div>

      <div className="side-scroll">
        <div className="group-label">Recents</div>
        {visibleBooks.map((b) => {
          const active = b.id === activeBookId
          if (editingId === b.id) {
            return (
              <div key={b.id} className={'chat' + (active ? ' is-active' : '')}>
                <input
                  className="chat-rename"
                  autoFocus
                  defaultValue={b.name}
                  onBlur={(e) => {
                    rename(b.id, e.currentTarget.value.trim() || b.name)
                    setEditingId(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                />
              </div>
            )
          }
          return (
            <div
              key={b.id}
              className={'chat' + (active ? ' is-active' : '')}
              onClick={() => setActive(b.id)}
              onDoubleClick={() => setEditingId(b.id)}
              title="Double-click to rename"
            >
              <span>{b.name}</span>
              <button
                className="dots-btn"
                title="More"
                onClick={(e) => {
                  e.stopPropagation()
                  setConfirmDeleteId(null)
                  setMenuId(menuId === b.id ? null : b.id)
                }}
              >
                <Dots className="icon icon-sm dots" />
              </button>
              {menuId === b.id && (
                <div className="chat-menu" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setActive(b.id)
                      setMenuId(null)
                    }}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(b.id)
                      setMenuId(null)
                    }}
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      relocateBook(b.id)
                      setMenuId(null)
                    }}
                  >
                    Relocate
                  </button>
                  <button
                    className="danger"
                    onClick={() => {
                      if (confirmDeleteId === b.id) {
                        deleteBook(b.id)
                        setMenuId(null)
                        setConfirmDeleteId(null)
                      } else {
                        setConfirmDeleteId(b.id)
                      }
                    }}
                  >
                    {confirmDeleteId === b.id ? 'Confirm delete' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
        {visibleBooks.length === 0 && <div className="empty-recents">No chats found</div>}
      </div>

      <div className="account">
        <div className="avatar">A</div>
        <div className="account-meta">
          <span className="account-name">admin</span>
          <span className="account-plan">Claude Pro</span>
        </div>
        <Chevron className="icon icon-sm chev" />
      </div>
    </aside>
  )
}
