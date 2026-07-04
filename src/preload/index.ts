import { contextBridge, ipcRenderer } from 'electron'

// 跨 IPC 的书籍结构(纯 JSON)
export interface IpcChapter {
  index: number
  title: string
  text: string
}
export interface IpcBook {
  title: string
  author?: string
  format: string
  chapters: IpcChapter[]
  totalChars: number
}
export type OpenBookResult = IpcBook | { error: string } | null

// 白名单 IPC(§6.2)。渲染层通过 window.api 判断是否在 Electron 中,
// 不在(纯浏览器预览/网页版)则 window.api 为 undefined,走浏览器降级。
const api = {
  platform: process.platform,
  /** 打开文件对话框并解析书籍;取消返回 null,失败返回 { error } */
  openBook(): Promise<OpenBookResult> {
    return ipcRenderer.invoke('book:open')
  }
}

export type MoyuApi = typeof api

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('api', api)
} else {
  // @ts-ignore contextIsolation 关闭时的兜底
  window.api = api
}
