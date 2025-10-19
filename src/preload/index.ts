/**
 * Preload Script
 * IPC 브릿지: Renderer ↔ Main 프로세스 안전한 통신
 */
import { contextBridge, ipcRenderer } from 'electron'
import { CrawlerOptions, JobPosting } from '../main/job/crawler'

// Renderer에 노출할 안전한 API
const api = {
  /**
   * 원티드 채용 공고 크롤링
   */
  crawlWanted: (options?: CrawlerOptions): Promise<JobPosting[]> => {
    return ipcRenderer.invoke('crawl-wanted', options)
  },

  /**
   * 모든 사이트 크롤링
   */
  crawlAllSites: (options?: CrawlerOptions): Promise<JobPosting[]> => {
    return ipcRenderer.invoke('crawl-all-sites', options)
  },

  /**
   * 저장된 채용 공고 목록 조회
   */
  getJobs: (): Promise<JobPosting[]> => {
    return ipcRenderer.invoke('get-jobs')
  },

  /**
   * 모든 데이터 삭제
   */
  clearAllData: (): Promise<void> => {
    return ipcRenderer.invoke('clear-all-data')
  },

  /**
   * 모든 공고의 상세 내용 로드 시작
   */
  loadJobDetails: (): Promise<void> => {
    return ipcRenderer.invoke('load-job-details')
  },

  /**
   * 공고 상세 내용 로드 이벤트 리스너
   * @param callback 공고가 로드될 때마다 호출되는 콜백
   */
  onJobDetailLoaded: (callback: (job: JobPosting) => void) => {
    ipcRenderer.on('job-detail-loaded', (_event, job) => callback(job))
  },

  /**
   * 공고 상세 내용 로드 완료 이벤트 리스너
   */
  onJobDetailsCompleted: (callback: () => void) => {
    ipcRenderer.on('job-details-completed', () => callback())
  },

  /**
   * 공고 상세 내용 로드 중단 이벤트 리스너
   */
  onJobDetailsStopped: (callback: () => void) => {
    ipcRenderer.on('job-details-stopped', () => callback())
  },

  /**
   * 공고 상세 내용 로드 중단 요청
   */
  stopJobDetails: (): Promise<void> => {
    return ipcRenderer.invoke('stop-job-details')
  },

  /**
   * AI 채팅 요청
   * @param jobId 공고 ID
   * @param prompt 사용자 프롬프트
   */
  aiChat: (
    jobId: string,
    prompt: string
  ): Promise<{ success: boolean; response?: string; error?: string; job?: JobPosting }> => {
    return ipcRenderer.invoke('ai-chat', jobId, prompt)
  },

  /**
   * AI 채팅 스트리밍 청크 이벤트 리스너
   * @param callback 청크가 도착할 때마다 호출되는 콜백
   */
  onAiChatChunk: (callback: (data: { jobId: string; chunk: string }) => void) => {
    ipcRenderer.on('ai-chat-chunk', (_event, data) => callback(data))
  },
}

// window.api로 노출
contextBridge.exposeInMainWorld('api', api)
