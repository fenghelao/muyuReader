import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

// Electron 三段构建:main(Node)/ preload / renderer(React)
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: { outDir: 'out/main' }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: { outDir: 'out/preload' }
  },
  renderer: {
    root: 'src/renderer',
    resolve: { alias: { '@': resolve('src/renderer/src') } },
    plugins: [react()],
    build: {
      outDir: 'out/renderer',
      // 两个入口:index=阅读视图,decoy=老板键遮羞视图(§9.1 双 WebContentsView)
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html'),
          decoy: resolve('src/renderer/decoy.html')
        }
      }
    }
  }
})
