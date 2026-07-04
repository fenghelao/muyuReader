import { join } from 'path'
import { app, globalShortcut, BaseWindow, WebContentsView } from 'electron'

// PROJECT_PLAN §9.1:窗口模型统一用 BaseWindow + WebContentsView。
// M1 先挂 reader 单视图;M3 再加常驻 decoy 遮羞视图做零闪烁老板键。
let win: BaseWindow | null = null
let readerView: WebContentsView | null = null

function layout(): void {
  if (!win || !readerView) return
  const { width, height } = win.getContentBounds()
  readerView.setBounds({ x: 0, y: 0, width, height })
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

  readerView = new WebContentsView({
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  win.contentView.addChildView(readerView)

  // 标题伪装:锁死 Claude,禁止 HTML <title> 覆盖(§9.2)
  win.setTitle('Claude')
  readerView.webContents.on('page-title-updated', (e) => e.preventDefault())

  const devUrl = process.env['ELECTRON_RENDERER_URL']
  if (devUrl) readerView.webContents.loadURL(devUrl)
  else readerView.webContents.loadFile(join(__dirname, '../renderer/index.html'))

  layout()
  win.on('resize', layout)
  win.on('closed', () => {
    // BaseWindow 关闭不会自动销毁子视图的 webContents(§9.6),显式清理
    readerView?.webContents.close()
    readerView = null
    win = null
  })
}

function registerBossKey(): void {
  // M1:老板键先转发给渲染层切「页面内 decoy」;M3 升级为主进程同步切第二个 WebContentsView
  const send = (): void => readerView?.webContents.send('boss:toggle')
  const ok = globalShortcut.register('CommandOrControl+Shift+Space', send)
  if (!ok) globalShortcut.register('CommandOrControl+`', send)
}

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
