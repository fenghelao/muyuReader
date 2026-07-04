import { join } from 'path'
import { app, globalShortcut, BaseWindow, WebContentsView, ipcMain, dialog } from 'electron'
import { openAndParse } from './parsers'

// PROJECT_PLAN §9.1:BaseWindow + 两个 WebContentsView(reader 叠上层 / decoy 常驻底层)。
// 老板键只切 reader 可见性 → 零 loadURL、零白屏。
let win: BaseWindow | null = null
let readerView: WebContentsView | null = null
let decoyView: WebContentsView | null = null
let bossHidden = false

function layout(): void {
  if (!win) return
  const { width, height } = win.getContentBounds()
  const bounds = { x: 0, y: 0, width, height }
  readerView?.setBounds(bounds)
  decoyView?.setBounds(bounds)
}

// dev 走 vite dev server,prod 走打包 html
function loadPage(view: WebContentsView, page: 'index' | 'decoy'): void {
  const devUrl = process.env['ELECTRON_RENDERER_URL']
  if (devUrl) view.webContents.loadURL(page === 'index' ? devUrl : `${devUrl}/${page}.html`)
  else view.webContents.loadFile(join(__dirname, `../renderer/${page}.html`))
}

function lockTitle(view: WebContentsView): void {
  // §9.2:锁死窗口标题,禁止 HTML <title> 覆盖
  view.webContents.on('page-title-updated', (e) => e.preventDefault())
}

function createWindow(): void {
  win = new BaseWindow({
    width: 1200,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    title: 'Claude',
    backgroundColor: '#F5F4ED'
  })

  // decoy 先建、常驻底层、预加载(切换时零闪烁)
  decoyView = new WebContentsView({ webPreferences: { sandbox: false } })
  win.contentView.addChildView(decoyView)
  loadPage(decoyView, 'decoy')
  lockTitle(decoyView)

  // reader 叠在上层
  readerView = new WebContentsView({
    webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: false }
  })
  win.contentView.addChildView(readerView)
  loadPage(readerView, 'index')
  lockTitle(readerView)

  win.setTitle('Claude')
  layout()
  win.on('resize', layout)
  win.on('closed', () => {
    // §9.6:BaseWindow 关闭不自动销毁子视图 webContents,显式清理
    readerView?.webContents.close()
    decoyView?.webContents.close()
    readerView = null
    decoyView = null
    win = null
  })
}

function toggleBoss(): void {
  if (!readerView) return
  bossHidden = !bossHidden
  readerView.setVisible(!bossHidden) // 只切可见性
  if (bossHidden) decoyView?.webContents.focus()
  else readerView.webContents.focus()
}

function registerBossKey(): void {
  const ok = globalShortcut.register('CommandOrControl+Shift+Space', toggleBoss)
  if (!ok) globalShortcut.register('CommandOrControl+`', toggleBoss)
}

// M2:打开文件对话框 + 解析成 Book(纯 JSON 回传渲染层)
ipcMain.handle('book:open', async () => {
  if (!win) return null
  // Electron 31 的 dialog 运行时接受 BaseWindow,但类型仍标 BrowserWindow,cast 之
  const r = await dialog.showOpenDialog(win as unknown as Electron.BrowserWindow, {
    title: '导入书籍',
    filters: [{ name: '电子书 (TXT / EPUB / PDF)', extensions: ['txt', 'epub', 'pdf'] }],
    properties: ['openFile']
  })
  if (r.canceled || !r.filePaths[0]) return null
  return openAndParse(r.filePaths[0])
})

app.whenReady().then(() => {
  createWindow()
  registerBossKey()
  app.on('activate', () => {
    if (!win) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => globalShortcut.unregisterAll())
