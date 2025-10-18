import { JobPosting, CrawlerOptions, JobSource } from '../crawler'
import { WantedCrawler } from '../crawler'
import { WantedAdapter } from '../crawler'
import { SaraminCrawler } from '../crawler'
import { SaraminAdapter } from '../crawler'
import { JumpitCrawler } from '../crawler'
import { JumpitAdapter } from '../crawler'
import { JobStorage } from '../storage'

/**
 * 채용 공고 서비스
 * 크롤링, 변환, 저장 오케스트레이션
 */
export class JobService {
  private storage: JobStorage

  constructor(storage?: JobStorage) {
    this.storage = storage || new JobStorage()
  }

  /**
   * 특정 사이트에서 채용 공고 크롤링
   * @param source 채용 사이트
   * @param options 크롤링 옵션
   * @returns 통일된 채용 공고 배열
   */
  async crawlSite(source: JobSource, options?: CrawlerOptions): Promise<JobPosting[]> {
    let jobs: JobPosting[] = []

    switch (source) {
      case 'wanted': {
        const crawler = new WantedCrawler()
        const adapter = new WantedAdapter()
        try {
          const rawJobs = await crawler.fetchJobList(options)
          jobs = rawJobs.map(raw => adapter.adapt(raw))
          await this.storage.saveRawData('wanted', rawJobs)
        } finally {
          await crawler.close()
        }
        break
      }

      case 'saramin': {
        const crawler = new SaraminCrawler()
        const adapter = new SaraminAdapter()
        try {
          const rawJobs = await crawler.fetchJobList(options)
          jobs = rawJobs.map(raw => adapter.adapt(raw))
          await this.storage.saveRawData('saramin', rawJobs)
        } finally {
          await crawler.close()
        }
        break
      }

      case 'jumpit': {
        const crawler = new JumpitCrawler()
        const adapter = new JumpitAdapter()
        try {
          const rawJobs = await crawler.fetchJobList(options)
          jobs = rawJobs.map(raw => adapter.adapt(raw))
          await this.storage.saveRawData('jumpit', rawJobs)
        } finally {
          await crawler.close()
        }
        break
      }
    }

    return jobs
  }

  /**
   * 모든 사이트에서 채용 공고 크롤링
   * @param options 크롤링 옵션
   * @returns 통일된 채용 공고 배열
   */
  async crawlAllSites(options?: CrawlerOptions): Promise<JobPosting[]> {
    const results: JobPosting[] = []

    // 순차적으로 크롤링 (병렬 처리 시 브라우저 리소스 과다 사용 방지)
    const wantedJobs = await this.crawlSite('wanted', options)
    results.push(...wantedJobs)

    const saraminJobs = await this.crawlSite('saramin', options)
    results.push(...saraminJobs)

    const jumpitJobs = await this.crawlSite('jumpit', options)
    results.push(...jumpitJobs)

    // 통합 데이터 저장
    await this.storage.saveNormalizedData(results)

    return results
  }

  /**
   * 저장된 채용 공고 목록 조회
   * @returns 통일된 채용 공고 배열
   */
  async getJobs(): Promise<JobPosting[]> {
    return await this.storage.loadJobs()
  }

  /**
   * 모든 데이터 삭제
   */
  async clearAllData(): Promise<void> {
    await this.storage.clearAll()
  }
}
