import { JobPosting, JobSource } from '../crawler'

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
   * 모든 데이터 삭제
   */
  clearAll(): Promise<void>
}
