import { useStore } from '../store'
import { Chevron, Plus, SearchIcon, SendArrow, Sparkle } from './icons'

// 老板键遮羞层:一屏干净的 Claude 空会话(M1 页面内实现;M3 升级独立 WebContentsView)
export default function Decoy() {
  const bossOn = useStore((s) => s.bossOn)
  return (
    <div className={'decoy' + (bossOn ? ' show' : '')}>
      <aside className="sidebar">
        <div className="brand">
          <Sparkle className="brand-logo" />
          <span className="brand-name">Claude</span>
        </div>
        <button className="side-btn">
          <Plus className="icon icon-sm" />
          New chat
        </button>
        <div className="search">
          <SearchIcon className="icon icon-sm" />
          <input placeholder="Search chats…" />
        </div>
        <div className="side-scroll">
          <div className="group-label">Recents</div>
          <div className="chat">
            <span>Debug WebSocket reconnect</span>
          </div>
          <div className="chat">
            <span>Refactor auth middleware</span>
          </div>
          <div className="chat">
            <span>SQL query optimization</span>
          </div>
        </div>
        <div className="account">
          <div className="avatar">K</div>
          <div className="account-meta">
            <span className="account-name">Kyrie Chen</span>
            <span className="account-plan">Claude Pro</span>
          </div>
        </div>
      </aside>
      <div className="decoy-main">
        <div className="decoy-hi">
          <Sparkle />
          晚上好，Kyrie
        </div>
        <div className="composer">
          <textarea rows={1} placeholder="How can I help you today?" />
          <div className="composer-tools">
            <button className="ctool">
              <Plus className="icon icon-sm" />
            </button>
            <div className="cmodel">
              Claude Opus 4.8 <Chevron className="icon icon-sm" />
            </div>
            <button className="send">
              <SendArrow className="icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
