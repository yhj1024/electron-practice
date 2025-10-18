import fs from 'fs/promises'
import path from 'path'
import { app } from 'electron'
import { IStorage, StorageOptions } from './types'
import { JobPosting, JobSource } from '../crawler'

/**
 * JSON 파일 기반 채용 공고 저장소
 */
export class JobStorage implements IStorage {
  private dataDir: string

  constructor(options: StorageOptions = {}) {
    // 기본 데이터 디렉토리: ~/Library/Application Support/electron-saju/jobs
    this.dataDir = options.dataDir || path.join(app.getPath('userData'), 'jobs')
  }

  /**
   * 데이터 디렉토리 초기화 (없으면 생성)
   */
  private async ensureDataDir(): Promise<void> {
    try {
      await fs.access(this.dataDir)
    } catch {
      await fs.mkdir(this.dataDir, { recursive: true })
    }
  }

  /**
   * 파일 경로 생성
   */
  private getFilePath(filename: string): string {
    return path.join(this.dataDir, filename)
  }

  /**
   * 원본 데이터 저장 (사이트별)
   */
  async saveRawData(source: JobSource, data: unknown[]): Promise<void> {
    await this.ensureDataDir()
    const filePath = this.getFilePath(`${source}-raw.json`)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
  }

  /**
   * 통일된 데이터 저장
   */
  async saveNormalizedData(jobs: JobPosting[]): Promise<void> {
    await this.ensureDataDir()
    const filePath = this.getFilePath('normalized.json')
    await fs.writeFile(filePath, JSON.stringify(jobs, null, 2), 'utf-8')
  }

  /**
   * 저장된 채용 공고 목록 로드
   */
  async loadJobs(): Promise<JobPosting[]> {
    try {
      const filePath = this.getFilePath('normalized.json')
      const content = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(content) as JobPosting[]
    } catch {
      // 파일이 없거나 읽기 실패 시 빈 배열 반환
      return []
    }
  }

  /**
   * 특정 사이트의 원본 데이터 로드
   */
  async loadRawData(source: JobSource): Promise<unknown[]> {
    try {
      const filePath = this.getFilePath(`${source}-raw.json`)
      const content = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(content) as unknown[]
    } catch {
      // 파일이 없거나 읽기 실패 시 빈 배열 반환
      return []
    }
  }

  /**
   * 모든 데이터 삭제
   */
  async clearAll(): Promise<void> {
    try {
      await fs.rm(this.dataDir, { recursive: true, force: true })
    } catch {
      // 디렉토리가 없는 경우 무시
    }
  }
}
