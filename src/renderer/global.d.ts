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

      /**
       * 모든 공고의 상세 내용 로드 시작
       */
      loadJobDetails: () => Promise<void>

      /**
       * 공고 상세 내용 로드 이벤트 리스너
       */
      onJobDetailLoaded: (callback: (job: JobPosting) => void) => void

      /**
       * 공고 상세 내용 로드 완료 이벤트 리스너
       */
      onJobDetailsCompleted: (callback: () => void) => void

      /**
       * 공고 상세 내용 로드 중단 이벤트 리스너
       */
      onJobDetailsStopped: (callback: () => void) => void

      /**
       * 공고 상세 내용 로드 중단 요청
       */
      stopJobDetails: () => Promise<void>

      /**
       * AI 채팅 요청
       */
      aiChat: (
        jobId: string,
        prompt: string
      ) => Promise<{ success: boolean; response?: string; error?: string; job?: JobPosting }>

      /**
       * AI 채팅 스트리밍 청크 이벤트 리스너
       */
      onAiChatChunk: (callback: (data: { jobId: string; chunk: string }) => void) => void
    }
  }
}

export {}
