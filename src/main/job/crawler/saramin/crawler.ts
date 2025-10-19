import * as cheerio from 'cheerio'
import type { Element } from 'domhandler'
import { httpClient } from '../common/http-client'
import { CrawlerOptions, ICrawler } from '../common/types'
import { SaraminRawJob } from './types'

/**
 * 사람인 크롤러
 * Cheerio를 사용한 HTML 파싱 방식
 */
export class SaraminCrawler implements ICrawler<SaraminRawJob> {
  private readonly BASE_URL = 'https://www.saramin.co.kr/zf_user/jobs/list/domestic'
  private readonly DEFAULT_CAT_KEWD = [2232, 87, 92] // 백엔드, 웹개발, 프론트엔드
  private readonly DEFAULT_LOC_CD = [101010, 101050, 101080, 101070, 101120, 101150] // 강남, 서초, 금천, 구로, 관악, 동작

  /**
   * 채용 공고 목록 수집
   * @param options 크롤링 옵션
   * @returns 원본 데이터 배열
   */
  async fetchJobList(options?: CrawlerOptions): Promise<SaraminRawJob[]> {
    const allJobs: SaraminRawJob[] = []
    let page = 1
    const maxPages = 20 // 최대 20페이지까지 수집 (100개씩 = 최대 2000개)

    console.log('🔍 사람인 크롤링 시작...')

    while (page <= maxPages) {
      try {
        const url = this.buildUrl(options, page)
        console.log(`  → ${page}페이지 요청 중...`)

        // HTML 다운로드
        const html = await httpClient.getText(url)

        // Cheerio로 파싱
        const $ = cheerio.load(html)
        const items = $('.box_item')

        if (items.length === 0) {
          console.log(`  → ${page}페이지에 공고가 없음 (종료)`)
          break
        }

        // 각 채용 공고 파싱
        items.each((_, el) => {
          try {
            const job = this.parseJobElement($, $(el))
            if (job) {
              allJobs.push(job)
            }
          } catch (err) {
            console.error('공고 파싱 실패:', err)
          }
        })

        console.log(`  → ${page}페이지: ${items.length}개 수집 (누적: ${allJobs.length}개)`)

        // 다음 페이지로
        page++

        // API 부하 방지를 위한 딜레이
        if (page <= maxPages) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } catch (err) {
        console.error(`${page}페이지 크롤링 실패:`, err)
        break
      }
    }

    console.log(`✅ 총 ${allJobs.length}개 공고 수집 완료`)
    return allJobs
  }

  /**
   * 개별 채용 공고 엘리먼트 파싱
   */
  private parseJobElement(
    $: cheerio.CheerioAPI,
    element: cheerio.Cheerio<Element>
  ): SaraminRawJob | null {
    try {
      // rec_idx 추출 (공고 ID)
      const recLink = element.find('.job_tit a')
      const href = recLink.attr('href') || ''
      const recIdxMatch = href.match(/rec_idx=(\d+)/)
      if (!recIdxMatch) return null

      const id = recIdxMatch[1]

      // 제목
      const title = recLink.find('span').text().trim()
      if (!title) return null

      // 회사명 (span 또는 a 태그 둘 다 지원)
      const company = element.find('.company_nm .str_tit').first().text().trim()

      // 지역
      const location = element.find('.work_place').text().trim() || '정보없음'

      // 직무 분야
      const sectors: string[] = []
      element.find('.job_sector span').each((_, el) => {
        const sector = $(el).text().trim()
        if (sector) sectors.push(sector)
      })

      // 경력 조건
      const experience = element.find('.career').text().trim() || '정보없음'

      // 마감일 (box_item의 부모에서 찾기)
      const deadline = element.parent().find('.support_info .date').text().trim() || '상시채용'

      // URL 생성
      const url = `https://www.saramin.co.kr/zf_user/jobs/relay/view?rec_idx=${id}`

      return {
        id,
        title,
        company,
        location,
        sectors,
        experience,
        deadline,
        url,
      }
    } catch (err) {
      console.error('엘리먼트 파싱 에러:', err)
      return null
    }
  }

  /**
   * URL 생성
   */
  private buildUrl(options?: CrawlerOptions, page = 1): string {
    const params = new URLSearchParams()

    // 지역 조건 (기본값: 서울 주요 구)
    if (options?.locations && options.locations.length > 0) {
      const locCodes = options.locations.map(loc => this.normalizeLocation(loc)).join(',')
      params.set('loc_cd', locCodes)
    } else {
      params.set('loc_cd', this.DEFAULT_LOC_CD.join(','))
    }

    // 직무 카테고리 (쉼표로 구분된 하나의 값)
    params.set('cat_kewd', this.DEFAULT_CAT_KEWD.join(','))

    // 추가 필수 파라미터
    params.set('search_optional_item', 'n')
    params.set('search_done', 'y')
    params.set('panel_count', 'y')
    params.set('preview', 'y')
    params.set('page_count', '100')
    params.set('page', page.toString())

    return `${this.BASE_URL}?${params.toString()}`
  }

  /**
   * 지역명을 사람인 API 형식으로 변환
   */
  private normalizeLocation(location: string): string {
    // noinspection NonAsciiCharacters
    const locationMap: Record<string, string> = {
      강남구: '101010',
      서초구: '101050',
      구로구: '101070',
      금천구: '101080',
      관악구: '101120',
      동작구: '101150',
    }

    return locationMap[location] || location
  }

  /**
   * 공고 상세 내용 크롤링
   */
  async fetchJobDetail(url: string): Promise<string> {
    try {
      const html = await httpClient.getText(url)
      const $ = cheerio.load(html)

      // 상세 내용 추출
      const sections: string[] = []

      // 제목
      const title = $('.tit_job').text().trim()
      if (title) sections.push(`# ${title}`)

      // 회사명
      const company = $('.company_nm a').text().trim()
      if (company) sections.push(`## ${company}`)

      // 주요 업무
      const jobDescription = $('.cont_wrap .content')
        .first()
        .text()
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
      if (jobDescription) {
        sections.push('## 주요 업무')
        sections.push(jobDescription)
      }

      // 자격 요건
      const requirements = $('.cont_wrap .content')
        .eq(1)
        .text()
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
      if (requirements) {
        sections.push('## 자격 요건')
        sections.push(requirements)
      }

      // 우대 사항
      const preferred = $('.cont_wrap .content')
        .eq(2)
        .text()
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
      if (preferred) {
        sections.push('## 우대 사항')
        sections.push(preferred)
      }

      // 근무 조건
      const conditions = $('.cont_wrap .conditions')
        .text()
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
      if (conditions) {
        sections.push('## 근무 조건')
        sections.push(conditions)
      }

      return sections.join('\n\n')
    } catch (err) {
      console.error('상세 페이지 크롤링 실패:', err)
      return '상세 정보를 불러올 수 없습니다.'
    }
  }

  /**
   * 리소스 정리
   */
  async close(): Promise<void> {
    // HTTP 클라이언트는 stateless이므로 정리할 것 없음
  }
}
