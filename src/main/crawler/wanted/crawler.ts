import { Browser } from 'puppeteer-core'
import { ICrawler, CrawlerOptions } from '../common/types'
import { WantedRawJob } from './types'

/**
 * 원티드 크롤러
 */
export class WantedCrawler implements ICrawler<WantedRawJob> {
  private browser: Browser | null = null

  /**
   * 원티드 채용 공고 목록 크롤링
   * @param _options 크롤링 옵션
   * @returns 원티드 원본 데이터 배열
   */
  async fetchJobList(_options?: CrawlerOptions): Promise<WantedRawJob[]> {
    throw new Error('Not implemented yet')
  }

  /**
   * 브라우저 인스턴스 종료
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}
