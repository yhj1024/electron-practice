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
}

// window.api로 노출
contextBridge.exposeInMainWorld('api', api)
