/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { JobService } from './job-service'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'

describe('JobService with File Storage', () => {
  let testDir: string
  let jobService: JobService

  beforeEach(async () => {
    // 테스트용 임시 디렉토리 생성
    testDir = path.join(os.tmpdir(), `electron-saju-test-${Date.now()}`)
    await fs.mkdir(testDir, { recursive: true })

    // 테스트용 JobService 인스턴스
    jobService = new JobService({ dataDir: testDir })
  })

  afterEach(async () => {
    // 테스트 후 임시 디렉토리 삭제
    try {
      await fs.rm(testDir, { recursive: true, force: true })
    } catch (error) {
      console.warn('Failed to clean up test directory:', error)
    }
  })

  it('should crawl Wanted jobs and save to JSON files', async () => {
    // 원티드 크롤링 (최대 3개만)
    const jobs = await jobService.crawlSite('wanted', {
      locations: ['강남구'],
      limit: 3,
    })

    expect(jobs).toBeDefined()
    expect(Array.isArray(jobs)).toBe(true)
    expect(jobs.length).toBeGreaterThan(0)
    expect(jobs.length).toBeLessThanOrEqual(3)

    // 모든 공고가 wanted 소스인지 확인
    jobs.forEach(job => {
      expect(job.source).toBe('wanted')
      expect(job.id).toMatch(/^wanted-\d+$/)
    })

    console.log(`✅ ${jobs.length}개 공고 크롤링 완료`)

    // crawlSite는 raw 데이터만 저장하므로 normalized 데이터 수동 저장
    const storage = new (await import('../storage/job-storage')).JobStorage({ dataDir: testDir })
    await storage.saveNormalizedData(jobs)

    // JSON 파일 생성 확인
    const rawFilePath = path.join(testDir, 'wanted-raw.json')
    const normalizedFilePath = path.join(testDir, 'normalized.json')

    const rawFileExists = await fs
      .access(rawFilePath)
      .then(() => true)
      .catch(() => false)
    const normalizedFileExists = await fs
      .access(normalizedFilePath)
      .then(() => true)
      .catch(() => false)

    expect(rawFileExists).toBe(true)
    expect(normalizedFileExists).toBe(true)

    console.log(`✅ JSON 파일 생성 확인:`)
    console.log(`  - ${rawFilePath}`)
    console.log(`  - ${normalizedFilePath}`)

    // 파일 내용 확인
    const rawContent = await fs.readFile(rawFilePath, 'utf-8')
    const normalizedContent = await fs.readFile(normalizedFilePath, 'utf-8')

    const rawData = JSON.parse(rawContent)
    const normalizedData = JSON.parse(normalizedContent)

    expect(Array.isArray(rawData)).toBe(true)
    expect(Array.isArray(normalizedData)).toBe(true)
    expect(rawData.length).toBe(jobs.length)
    expect(normalizedData.length).toBe(jobs.length)

    console.log(`✅ 파일 내용 검증 완료`)
    console.log(`  - Raw data: ${rawData.length}개`)
    console.log(`  - Normalized data: ${normalizedData.length}개`)
    console.log('')
    console.log('샘플 JobPosting:')
    console.log(JSON.stringify(normalizedData[0], null, 2))
  })
})
