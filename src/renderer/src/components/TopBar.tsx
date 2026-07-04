import { useStore } from '../store'
import { Chevron, Dots, Share, Star } from './icons'

export default function TopBar() {
  const books = useStore((s) => s.books)
  const activeBookId = useStore((s) => s.activeBookId)
  const active = books.find((b) => b.id === activeBookId)

  return (
    <div className="topbar">
      <div className="book-title">{active?.name ?? 'Claude'}</div>
      <div className="model-pick">
        Claude Opus 4.8 <Chevron className="icon icon-sm" />
      </div>
      <div className="topbar-right">
        <button className="tb-btn">
          <Share className="icon icon-sm" />
          Share
        </button>
        <button className="tb-btn tb-ico" title="收藏">
          <Star className="icon icon-sm" />
        </button>
        <button className="tb-btn tb-ico" title="更多">
          <Dots className="icon icon-sm" />
        </button>
      </div>
    </div>
  )
}
