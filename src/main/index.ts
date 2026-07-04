import { join } from 'path'
import { app, globalShortcut, BaseWindow, WebContentsView, ipcMain, dialog } from 'electron'
import { deleteBook, getLibraryState, importBook, loadBook, relocateBook, renameBook, saveProgress } from './store/library'

let win: BaseWindow | null = null
let readerView: WebContentsView | null = null
let decoyView: WebContentsView | null = null
let bossHidden = false
const APP_NAME = 'MuYuReader'

function layout(): void {
  if (!win) return
  const { width, height } = win.getContentBounds()
  const bounds = { x: 0, y: 0, width, height }
  readerView?.setBounds(bounds)
  decoyView?.setBounds(bounds)
}

function loadPage(view: WebContentsView, page: 'index' | 'decoy'): void {
  const devUrl = process.env['ELECTRON_RENDERER_URL']
  if (devUrl) view.webContents.loadURL(page === 'index' ? devUrl : `${devUrl}/${page}.html`)
  else view.webContents.loadFile(join(__dirname, `../renderer/${page}.html`))
}

function lockTitle(view: WebContentsView): void {
  view.webContents.on('page-title-updated', (e) => e.preventDefault())
}

function setBossHidden(hidden: boolean): boolean {
  if (!readerView) return bossHidden
  bossHidden = hidden
  readerView.setVisible(!bossHidden)
  win?.setTitle(APP_NAME)
  if (bossHidden) decoyView?.webContents.focus()
  else readerView.webContents.focus()
  readerView.webContents.send('boss:changed', bossHidden)
  return bossHidden
}

function toggleBoss(): void {
  setBossHidden(!bossHidden)
}

function registerBossEsc(view: WebContentsView, hidden: boolean): void {
  view.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown' || input.key !== 'Escape') return
    event.preventDefault()
    setBossHidden(hidden)
  })
}

function createWindow(): void {
  win = new BaseWindow({
    width: 1200,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    title: APP_NAME,
    backgroundColor: '#F5F4ED'
  })

  decoyView = new WebContentsView({ webPreferences: { sandbox: false } })
  win.contentView.addChildView(decoyView)
  loadPage(decoyView, 'decoy')
  lockTitle(decoyView)
  registerBossEsc(decoyView, false)

  readerView = new WebContentsView({
    webPreferences: { preload: join(__dirname, '../preload/index.js'), sandbox: false }
  })
  win.contentView.addChildView(readerView)
  loadPage(readerView, 'index')
  lockTitle(readerView)
  registerBossEsc(readerView, true)

  win.setTitle(APP_NAME)
  layout()
  win.on('resize', layout)
  win.on('closed', () => {
    readerView?.webContents.close()
    decoyView?.webContents.close()
    readerView = null
    decoyView = null
    win = null
    bossHidden = false
  })
}

function registerBossKey(): void {
  const ok = globalShortcut.register('CommandOrControl+Shift+Space', toggleBoss)
  if (!ok) globalShortcut.register('CommandOrControl+`', toggleBoss)
}

ipcMain.handle('book:open', async () => {
  if (!win) return null
  const r = await dialog.showOpenDialog(win as unknown as Electron.BrowserWindow, {
    title: '导入书籍',
    filters: [{ name: '电子书 (TXT / EPUB / PDF)', extensions: ['txt', 'epub', 'pdf'] }],
    properties: ['openFile']
  })
  if (r.canceled || !r.filePaths[0]) return null
  return importBook(r.filePaths[0])
})

ipcMain.handle('library:get', () => getLibraryState())

ipcMain.handle('library:load-book', (_event, bookId: string) => loadBook(bookId))

ipcMain.handle('library:save-progress', (_event, fileHash: string, blockIndex: number) => {
  saveProgress(fileHash, blockIndex)
})

ipcMain.handle('library:rename-book', (_event, bookId: string, name: string) => renameBook(bookId, name))

ipcMain.handle('library:delete-book', (_event, bookId: string) => deleteBook(bookId))

ipcMain.handle('library:relocate-book', async (_event, bookId: string) => {
  if (!win) return null
  const r = await dialog.showOpenDialog(win as unknown as Electron.BrowserWindow, {
    title: '重新选择文件',
    filters: [{ name: '电子书 (TXT / EPUB / PDF)', extensions: ['txt', 'epub', 'pdf'] }],
    properties: ['openFile']
  })
  if (r.canceled || !r.filePaths[0]) return null
  return relocateBook(bookId, r.filePaths[0])
})

ipcMain.handle('boss:get', () => bossHidden)

ipcMain.handle('boss:toggle', () => setBossHidden(!bossHidden))

ipcMain.handle('boss:set', (_event, hidden: boolean) => setBossHidden(hidden))

app.whenReady().then(() => {
  app.setName(APP_NAME)
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
