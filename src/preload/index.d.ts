import type { MoyuApi } from './index'

declare global {
  interface Window {
    api?: MoyuApi
  }
}

export {}
