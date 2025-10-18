import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { JobService } from './job/services'

const VITE_DEV_SERVER_URL = process.env['ELECTRON_RENDERER_URL']
const VITE_PRELOAD_PATH = process.env['ELECTRON_PRELOAD_URL']

// JobService 인스턴스 (싱글톤)
const jobService = new JobService()

// IPC 핸들러 등록
function registerIpcHandlers() {
  // 원티드 크롤링
  ipcMain.handle('crawl-wanted', async (_event, options) => {
    console.log('🔍 원티드 크롤링 시작:', options)
    const jobs = await jobService.crawlSite('wanted', options)
    console.log(`✅ ${jobs.length}개 공고 수집 완료`)
    return jobs
  })

  // 모든 사이트 크롤링
  ipcMain.handle('crawl-all-sites', async (_event, options) => {
    console.log('🔍 전체 사이트 크롤링 시작:', options)
    const jobs = await jobService.crawlAllSites(options)
    console.log(`✅ ${jobs.length}개 공고 수집 완료`)
    return jobs
  })

  // 저장된 공고 조회
  ipcMain.handle('get-jobs', async () => {
    const jobs = await jobService.getJobs()
    console.log(`📋 저장된 공고: ${jobs.length}개`)
    return jobs
  })

  // 데이터 삭제
  ipcMain.handle('clear-all-data', async () => {
    console.log('🗑️ 모든 데이터 삭제')
    await jobService.clearAllData()
  })
}

app.whenReady().then(() => {
  // IPC 핸들러 등록
  registerIpcHandlers()

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: VITE_PRELOAD_PATH || path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
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
