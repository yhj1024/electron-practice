import {httpClient} from '../common/http-client'
import {CrawlerOptions, ICrawler} from '../common/types'
import {JumpitApiResponse, JumpitRawJob} from './types'

/**
 * 점핏 크롤러
 * 점핏 API를 통한 채용 공고 수집
 */
export class JumpitCrawler implements ICrawler<JumpitRawJob> {
  private readonly API_BASE = 'https://jumpit-api.saramin.co.kr/api/positions'
  private readonly DEFAULT_JOB_CATEGORIES = [2, 3] // 프론트엔드, 웹 풀스택

  /**
   * 채용 공고 목록 수집 (페이지네이션으로 전체 데이터 수집)
   * @param options 크롤링 옵션
   * @returns 원본 데이터 배열
   */
  async fetchJobList(options?: CrawlerOptions): Promise<JumpitRawJob[]> {
    const allJobs: JumpitRawJob[] = []
    let page = 1
    let hasMore = true

    console.log('🔍 점핏 API 크롤링 시작...')

    while (hasMore) {
      const url = this.buildApiUrl(options, page)
      const response = await httpClient.get<JumpitApiResponse>(url)

      if (response.result && response.result.positions.length > 0) {
        allJobs.push(...response.result.positions)
        console.log(
          `  → ${allJobs.length}개 수집 중... (현재 페이지: ${page}, 총: ${response.result.totalCount}개)`
        )

        // 마지막 페이지 확인 (더 이상 데이터가 없으면 종료)
        if (allJobs.length >= response.result.totalCount || response.result.emptyPosition) {
          hasMore = false
        } else {
          page++
        }
      } else {
        hasMore = false
      }

      // API 부하 방지를 위한 딜레이 (100ms)
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`✅ 총 ${allJobs.length}개 공고 수집 완료`)
    return allJobs
  }

  /**
   * API URL 생성
   */
  private buildApiUrl(options?: CrawlerOptions, page = 1): string {
    // URL을 직접 문자열로 조합 (URLSearchParams 버그 회피)
    const queryParts: string[] = [
      `sort=popular`,
      `highlight=false`,
      `page=${page}`,
    ]

    // 직무 카테고리 (기본: 서버/백엔드, 프론트엔드)
    this.DEFAULT_JOB_CATEGORIES.forEach(category => {
      queryParts.push(`jobCategory=${category}`)
    })

    // 지역 조건
    if (options?.locations && options.locations.length > 0) {
      options.locations.forEach(location => {
        const locationTag = this.normalizeLocation(location)
        queryParts.push(`locationTag=${locationTag}`)
      })
    }

    return `${this.API_BASE}?${queryParts.join('&')}`
  }

  /**
   * 지역명을 점핏 API 형식으로 변환
   * 예: "강남구" -> "101010"
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
   * 리소스 정리 (API 기반이라 브라우저 없음)
   */
  async close(): Promise<void> {
    // HTTP 클라이언트는 stateless이므로 정리할 것 없음
  }
}
