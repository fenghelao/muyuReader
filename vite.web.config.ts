import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 纯浏览器版:把渲染层当普通 SPA 跑(供预览 / 将来网页版底座)。
// 渲染层通过 window.api 判断是否在 Electron 中,不在则走浏览器降级(Esc 老板键、localStorage)。
export default defineConfig({
  root: resolve(__dirname, 'src/renderer'),
  base: './',
  resolve: { alias: { '@': resolve(__dirname, 'src/renderer/src') } },
  plugins: [react()],
  server: { port: 4610, strictPort: true },
  build: { outDir: resolve(__dirname, 'dist-web'), emptyOutDir: true }
})
