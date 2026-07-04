import { useStore } from '../store'
import { Chevron, Share, Star } from './icons'
import SettingsMenu from './SettingsMenu'

export default function TopBar() {
  const books = useStore((s) => s.books)
  const activeBookId = useStore((s) => s.activeBookId)
  const displayMode = useStore((s) => s.displayMode)
  const setDisplayMode = useStore((s) => s.setDisplayMode)
  const active = books.find((b) => b.id === activeBookId)

  return (
    <div className="topbar">
      <div className="book-title">{active?.name ?? 'Claude'}</div>
      <div className="model-pick">
        Claude Opus 4.8 <Chevron className="icon icon-sm" />
      </div>
      <div className="topbar-right">
        <div className="view-switch" aria-label="View mode">
          <button className={displayMode === 'chat' ? 'is-active' : ''} onClick={() => setDisplayMode('chat')}>
            Claude
          </button>
          <button className={displayMode === 'reader' ? 'is-active' : ''} onClick={() => setDisplayMode('reader')}>
            Reader
          </button>
        </div>
        <button className="tb-btn">
          <Share className="icon icon-sm" />
          Share
        </button>
        <button className="tb-btn tb-ico" title="Star">
          <Star className="icon icon-sm" />
        </button>
        <SettingsMenu />
      </div>
    </div>
  )
}
