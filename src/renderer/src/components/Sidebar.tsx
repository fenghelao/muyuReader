import { useState } from 'react'
import { useStore } from '../store'
import { Chevron, Dots, Plus, SearchIcon, Sparkle } from './icons'

export default function Sidebar() {
  const books = useStore((s) => s.books)
  const activeBookId = useStore((s) => s.activeBookId)
  const setActive = useStore((s) => s.setActive)
  const rename = useStore((s) => s.rename)
  const loadBook = useStore((s) => s.loadBook)
  const showError = useStore((s) => s.showError)
  const [editingId, setEditingId] = useState<string | null>(null)

  // New chat = 导入一本书(Electron 里弹文件框;纯浏览器无 window.api 则无操作)
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
        <input placeholder="Search chats…" />
      </div>

      <div className="side-scroll">
        <div className="group-label">Recents</div>
        {books.map((b) => {
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
              title="双击改名"
            >
              <span>{b.name}</span>
              <Dots className="icon icon-sm dots" />
            </div>
          )
        })}
      </div>

      <div className="account">
        <div className="avatar">K</div>
        <div className="account-meta">
          <span className="account-name">Kyrie Chen</span>
          <span className="account-plan">Claude Pro</span>
        </div>
        <Chevron className="icon icon-sm chev" />
      </div>
    </aside>
  )
}
