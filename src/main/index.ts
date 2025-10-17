import { app, BrowserWindow } from 'electron'

const VITE_DEV_SERVER_URL = process.env['ELECTRON_RENDERER_URL']

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
  })

  win.webContents.openDevTools()

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile('out/renderer/index.html')
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
