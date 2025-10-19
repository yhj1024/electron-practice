import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'
import dotenv from 'dotenv'
import { JobService } from './job/services'
import { OllamaService } from './ai'

// .env 파일 로드
dotenv.config()

const VITE_DEV_SERVER_URL = process.env['ELECTRON_RENDERER_URL']
const VITE_PRELOAD_PATH = process.env['ELECTRON_PRELOAD_URL']

// JobService 인스턴스 (싱글톤)
const jobService = new JobService()

// AI 서비스 인스턴스
let aiService: OllamaService | null = null

// 상세 크롤링 중단 플래그
let shouldStopDetailCrawling = false

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

  // 모든 공고의 상세 내용 로드
  ipcMain.handle('load-job-details', async event => {
    console.log('📥 공고 상세 내용 로드 시작')
    shouldStopDetailCrawling = false

    // 저장된 모든 공고 가져오기
    const jobs = await jobService.getJobs()
    console.log(`📋 총 ${jobs.length}개 공고`)

    // 크롤러 인스턴스 준비
    const { WantedCrawler, SaraminCrawler, JumpitCrawler } = await import('./job/crawler')
    const crawlers = {
      wanted: new WantedCrawler(),
      saramin: new SaraminCrawler(),
      jumpit: new JumpitCrawler(),
    }

    try {
      // 각 공고의 상세 내용 로드
      for (let i = 0; i < jobs.length; i++) {
        // 중단 요청 확인
        if (shouldStopDetailCrawling) {
          console.log('⏹️  크롤링 중단됨')
          event.sender.send('job-details-stopped')
          break
        }

        const job = jobs[i]

        try {
          // 이미 상세 내용이 있으면 스킵
          if (job.detailContent) {
            console.log(`⏭️  ${i + 1}/${jobs.length} 이미 로드됨: ${job.title}`)
            continue
          }

          console.log(`🔄 ${i + 1}/${jobs.length} 로딩: ${job.title}`)

          // 크롤러 선택
          const crawler = crawlers[job.source]
          if (!crawler || !crawler.fetchJobDetail) {
            console.log(`⚠️  ${job.source} 크롤러는 상세 로드를 지원하지 않습니다`)
            continue
          }

          // 상세 내용 크롤링
          const detailContent = await crawler.fetchJobDetail(job.url)
          const updatedJob = {
            ...job,
            detailContent,
            detailLoadedAt: new Date().toISOString(),
          }

          // 스토리지에 저장
          await jobService.updateJob(updatedJob)

          // 업데이트된 공고를 renderer로 전송
          event.sender.send('job-detail-loaded', updatedJob)

          // 다음 요청 전 딜레이 (서버 부하 방지)
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (err) {
          console.error(`❌ ${job.title} 로드 실패:`, err)
        }
      }

      // 완료 이벤트 전송 (중단되지 않은 경우에만)
      if (!shouldStopDetailCrawling) {
        event.sender.send('job-details-completed')
        console.log('✅ 모든 상세 내용 로드 완료')
      }
    } finally {
      // 크롤러 정리
      await Promise.all([
        crawlers.wanted.close(),
        crawlers.saramin.close(),
        crawlers.jumpit.close(),
      ])
      shouldStopDetailCrawling = false
    }
  })

  // 상세 크롤링 중단
  ipcMain.handle('stop-job-details', async () => {
    console.log('🛑 크롤링 중단 요청')
    shouldStopDetailCrawling = true
  })

  // AI 채팅 요청 (스트리밍)
  ipcMain.handle('ai-chat', async (event, jobId: string, prompt: string) => {
    console.log(`🤖 AI 채팅 요청 - Job ID: ${jobId}, Prompt: "${prompt.substring(0, 50)}..."`)

    try {
      // AI 서비스 초기화 (lazy loading)
      if (!aiService) {
        aiService = new OllamaService()
      }

      // 해당 공고 가져오기
      const jobs = await jobService.getJobs()
      const job = jobs.find(j => j.id === jobId)

      if (!job) {
        throw new Error('공고를 찾을 수 없습니다.')
      }

      // 컨텍스트 생성 (첫 메시지에만 포함)
      const isFirstMessage = !job.aiMessages || job.aiMessages.length === 0
      const context = isFirstMessage
        ? `
제목: ${job.title}
회사: ${job.company}
지역: ${job.location || '미정'}
경력: ${job.requirements?.experience || '미정'}

${job.detailContent ? `상세 내용:\n${job.detailContent}` : ''}
`.trim()
        : undefined

      console.log(`⏳ AI 응답 스트리밍 시작... (첫 메시지: ${isFirstMessage})`)

      // AI 응답 생성 (스트리밍)
      const aiResponse = await aiService.chatStream(prompt, context, (chunk: string) => {
        // 실시간으로 렌더러에 청크 전송
        event.sender.send('ai-chat-chunk', { jobId, chunk })
      })

      console.log(`✅ AI 응답 완료 (${aiResponse.length}자)`)

      // 채팅 히스토리 업데이트
      const timestamp = new Date().toISOString()
      const aiMessages = [
        ...(job.aiMessages || []),
        { role: 'user' as const, content: prompt, timestamp },
        { role: 'assistant' as const, content: aiResponse, timestamp },
      ]

      // 응답을 공고에 저장
      const updatedJob = {
        ...job,
        aiMessages,
        // 하위 호환성을 위해 마지막 질문/답변도 저장
        aiPrompt: prompt,
        aiResponse,
        aiRespondedAt: timestamp,
      }

      await jobService.updateJob(updatedJob)

      console.log(`💾 저장 완료 - 총 ${aiMessages.length}개 메시지`)

      return {
        success: true,
        response: aiResponse,
        job: updatedJob,
      }
    } catch (err) {
      console.error('❌ AI 채팅 오류:', err)
      return {
        success: false,
        error: err instanceof Error ? err.message : 'AI 채팅 중 오류가 발생했습니다.',
      }
    }
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

  // 외부 링크를 시스템 브라우저로 열기
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
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
