import { Chevron, Plus, SearchIcon, SendArrow, Sparkle } from './icons'

// 独立遮羞视图:一屏干净的 Claude 新会话(M3 由主进程作为第二个 WebContentsView 加载)
export default function DecoyScreen() {
  return (
    <div className="app">
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
          <Chevron className="icon icon-sm chev" />
        </div>
      </aside>
      <main className="main">
        <div className="topbar">
          <div className="book-title">New chat</div>
          <div className="model-pick">
            Claude Opus 4.8 <Chevron className="icon icon-sm" />
          </div>
        </div>
        <div className="decoy-center">
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
      </main>
    </div>
  )
}
