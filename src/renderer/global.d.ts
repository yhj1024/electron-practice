/**
 * Global type definitions for Renderer process
 */
import { CrawlerOptions, JobPosting } from '../main/crawler'

declare global {
  interface Window {
    api: {
      /**
       * 원티드 채용 공고 크롤링
       */
      crawlWanted: (options?: CrawlerOptions) => Promise<JobPosting[]>

      /**
       * 모든 사이트 크롤링
       */
      crawlAllSites: (options?: CrawlerOptions) => Promise<JobPosting[]>

      /**
       * 저장된 채용 공고 목록 조회
       */
      getJobs: () => Promise<JobPosting[]>

      /**
       * 모든 데이터 삭제
       */
      clearAllData: () => Promise<void>
    }
  }
}

export {}
