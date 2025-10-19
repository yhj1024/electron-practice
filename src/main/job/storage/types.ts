import { JobPosting, JobSource } from '../crawler'

/**
 * 크롤링 실행 로그
 */
export interface CrawlLog {
  id: string // 고유 ID (타임스탬프 기반)
  source: JobSource // 크롤링 사이트
  startedAt: string // 시작 시간 (ISO 8601)
  completedAt?: string // 완료 시간 (ISO 8601)
  duration?: number // 소요 시간 (밀리초)
  totalItems: number // 수집한 공고 개수
  pagesScraped: number // 크롤링한 페이지 수
  status: 'running' | 'success' | 'failed' | 'partial' // 상태
  error?: string // 에러 메시지 (실패 시)
}

/**
 * 저장소 옵션
 */
export interface StorageOptions {
  dataDir?: string // 데이터 저장 디렉토리 (기본: app.getPath('userData')/jobs)
}

/**
 * 저장소 인터페이스
 */
export interface IStorage {
  /**
   * 원본 데이터 저장 (사이트별)
   * @param source 채용 사이트
   * @param data 원본 데이터 배열
   */
  saveRawData(source: JobSource, data: unknown[]): Promise<void>

  /**
   * 통일된 데이터 저장
   * @param jobs 통일된 채용 공고 배열
   */
  saveNormalizedData(jobs: JobPosting[]): Promise<void>

  /**
   * 저장된 채용 공고 목록 로드
   * @returns 통일된 채용 공고 배열
   */
  loadJobs(): Promise<JobPosting[]>

  /**
   * 특정 사이트의 원본 데이터 로드
   * @param source 채용 사이트
   * @returns 원본 데이터 배열
   */
  loadRawData(source: JobSource): Promise<unknown[]>

  /**
   * 크롤링 로그 저장
   * @param log 크롤링 로그
   */
  saveCrawlLog(log: CrawlLog): Promise<void>

  /**
   * 모든 크롤링 로그 로드
   * @returns 크롤링 로그 배열
   */
  loadCrawlLogs(): Promise<CrawlLog[]>

  /**
   * 모든 데이터 삭제
   */
  clearAll(): Promise<void>
}
