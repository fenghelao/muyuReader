import { contextBridge, ipcRenderer } from 'electron'

// 白名单 IPC(§6.2)。渲染层通过 window.api 判断是否在 Electron 中,
// 不在(纯浏览器预览/网页版)则 window.api 为 undefined,走浏览器降级。
const api = {
  platform: process.platform,
  /** 订阅老板键(主进程全局快捷键触发),返回取消订阅函数 */
  onBossToggle(cb: () => void): () => void {
    const listener = (): void => cb()
    ipcRenderer.on('boss:toggle', listener)
    return () => ipcRenderer.removeListener('boss:toggle', listener)
  }
}

export type MoyuApi = typeof api

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('api', api)
} else {
  // @ts-ignore contextIsolation 关闭时的兜底
  window.api = api
}
