import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/app.css'
import App from './App'
import { chunkBook, chunkText } from './disguise/chunker'
import { useStore } from './store'

// 开发期在浏览器控制台暴露测试钩子(仅 DEV):window.__moyu.chunkText(...) / .store
if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__moyu = { store: useStore, chunkText, chunkBook }
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
