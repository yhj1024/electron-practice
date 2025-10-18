/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest'
import { WantedCrawler } from './crawler'
import { WantedAdapter } from './adapter'

describe('WantedCrawler', () => {
  it('should fetch job listings from Wanted API', async () => {
    const crawler = new WantedCrawler()

    // 강남구 웹 개발자 공고 최대 5개
    const rawJobs = await crawler.fetchJobList({
      locations: ['강남구'],
      limit: 5,
    })

    expect(rawJobs).toBeDefined()
    expect(Array.isArray(rawJobs)).toBe(true)
    expect(rawJobs.length).toBeGreaterThan(0)
    expect(rawJobs.length).toBeLessThanOrEqual(5)

    // 첫 번째 공고 구조 확인
    const firstJob = rawJobs[0]
    expect(firstJob).toHaveProperty('id')
    expect(firstJob).toHaveProperty('position')
    expect(firstJob).toHaveProperty('company')
    expect(firstJob.company).toHaveProperty('name')
    expect(firstJob).toHaveProperty('address')
    expect(firstJob).toHaveProperty('employment_type')

    console.log('✅ API 응답 샘플:')
    console.log(JSON.stringify(firstJob, null, 2))

    await crawler.close()
  })

  it('should transform raw data to JobPosting format', async () => {
    const crawler = new WantedCrawler()
    const adapter = new WantedAdapter()

    const rawJobs = await crawler.fetchJobList({ limit: 1 })
    expect(rawJobs.length).toBeGreaterThan(0)

    const jobPosting = adapter.adapt(rawJobs[0])

    // JobPosting 구조 확인
    expect(jobPosting).toHaveProperty('id')
    expect(jobPosting.id).toMatch(/^wanted-\d+$/)
    expect(jobPosting.source).toBe('wanted')
    expect(jobPosting).toHaveProperty('title')
    expect(jobPosting).toHaveProperty('company')
    expect(jobPosting).toHaveProperty('url')
    expect(jobPosting.url).toMatch(/^https:\/\/www\.wanted\.co\.kr\/wd\/\d+$/)
    expect(jobPosting).toHaveProperty('location')
    expect(jobPosting).toHaveProperty('requirements')
    expect(jobPosting).toHaveProperty('crawledAt')

    console.log('✅ 변환된 JobPosting:')
    console.log(JSON.stringify(jobPosting, null, 2))

    await crawler.close()
  })
})
