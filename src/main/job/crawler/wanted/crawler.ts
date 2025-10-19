import { httpClient } from '../common/http-client'
import { ICrawler, CrawlerOptions } from '../common/types'
import { WantedRawJob, WantedApiResponse } from './types'

/**
 * 원티드 크롤러
 * 원티드 API를 통한 채용 공고 수집
 */
export class WantedCrawler implements ICrawler<WantedRawJob> {
  private readonly API_BASE = 'https://www.wanted.co.kr/api/chaos/navigation/v1/results'
  private readonly DEFAULT_JOB_GROUP_ID = 518 // 개발
  private readonly DEFAULT_JOB_IDS = [10110, 873, 669, 895] // 소프트웨어, 웹, 프론트엔드, Node

  /**
   * 채용 공고 목록 수집 (페이지네이션으로 전체 데이터 수집)
   * @param options 크롤링 옵션
   * @returns 원본 데이터 배열
   */
  async fetchJobList(options?: CrawlerOptions): Promise<WantedRawJob[]> {
    const allJobs: WantedRawJob[] = []
    const pageSize = 100 // 한 번에 100개씩
    let offset = 0
    let hasMore = true

    console.log('🔍 원티드 API 크롤링 시작...')

    while (hasMore) {
      const url = this.buildApiUrl(options, offset, pageSize)
      const response = await httpClient.get<WantedApiResponse>(url)

      if (response.data && response.data.length > 0) {
        allJobs.push(...response.data)
        console.log(
          `  → ${offset + response.data.length}개 수집 중... (현재 페이지: ${response.data.length}개)`
        )

        // 다음 페이지가 있는지 확인 (응답이 pageSize보다 적으면 마지막 페이지)
        if (response.data.length < pageSize) {
          hasMore = false
        } else {
          offset += pageSize
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
  private buildApiUrl(options?: CrawlerOptions, offset = 0, limit = 100): string {
    const params = new URLSearchParams({
      job_group_id: String(this.DEFAULT_JOB_GROUP_ID),
      country: 'kr',
      job_sort: 'job.latest_order',
    })

    // 직무 카테고리 (소프트웨어, 웹, 프론트엔드, Node)
    this.DEFAULT_JOB_IDS.forEach(jobId => {
      params.append('job_ids', String(jobId))
    })

    // 경력 조건 (0~10년 범위)
    if (options?.experience) {
      const years = this.parseExperience(options.experience)
      years.forEach(year => params.append('years', String(year)))
    } else {
      // 0년부터 10년까지 범위 (2개만)
      params.append('years', '0')
      params.append('years', '10')
    }

    // 지역 조건
    if (options?.locations && options.locations.length > 0) {
      options.locations.forEach(location => {
        params.append('locations', this.normalizeLocation(location))
      })
    }

    // 페이지네이션
    params.append('limit', String(limit))
    params.append('offset', String(offset))

    return `${this.API_BASE}?${params.toString()}`
  }

  /**
   * 경력 문자열을 년수 배열로 변환
   * 예: "3년 이상" -> [3, 4, 5, ..., 10]
   */
  private parseExperience(experience: string): number[] {
    // 간단한 파싱 (추후 개선 가능)
    const match = experience.match(/(\d+)/)
    if (match) {
      const minYears = parseInt(match[1], 10)
      return Array.from({ length: 11 - minYears }, (_, i) => minYears + i)
    }
    return [0, 10] // 기본값
  }

  /**
   * 지역명을 원티드 API 형식으로 변환
   * 예: "강남구" -> "seoul.gangnam-gu"
   */
  private normalizeLocation(location: string): string {
    // 간단한 매핑 (추후 확장 가능)
    // noinspection NonAsciiCharacters
    const locationMap: Record<string, string> = {
      강남구: 'seoul.gangnam-gu',
      서초구: 'seoul.seocho-gu',
      구로구: 'seoul.guro-gu',
      금천구: 'seoul.geumcheon-gu',
      관악구: 'seoul.gwanak-gu',
      동작구: 'seoul.dongjak-gu',
    }

    return locationMap[location] || location
  }

  /**
   * 공고 상세 내용 크롤링
   */
  async fetchJobDetail(url: string): Promise<string> {
    try {
      // URL에서 ID 추출
      const match = url.match(/\/wd\/(\d+)/)
      if (!match) {
        return '상세 정보를 불러올 수 없습니다.'
      }

      const jobId = match[1]

      // 원티드 상세 API 호출
      const apiUrl = `https://www.wanted.co.kr/api/chaos/jobs/v4/${jobId}/details`
      const response = await httpClient.get<{ data: { job: { detail: { intro: string; main_tasks: string; requirements: string; preferred_points: string; benefits: string } } } }>(apiUrl)

      const detail = response.data?.job?.detail
      if (!detail) {
        return '상세 정보를 불러올 수 없습니다.'
      }

      // 상세 내용 조합
      const sections: string[] = []

      if (detail.intro) {
        sections.push('## 회사 소개')
        sections.push(detail.intro.trim())
      }

      if (detail.main_tasks) {
        sections.push('\n## 주요 업무')
        sections.push(detail.main_tasks.trim())
      }

      if (detail.requirements) {
        sections.push('\n## 자격 요건')
        sections.push(detail.requirements.trim())
      }

      if (detail.preferred_points) {
        sections.push('\n## 우대 사항')
        sections.push(detail.preferred_points.trim())
      }

      if (detail.benefits) {
        sections.push('\n## 혜택 및 복지')
        sections.push(detail.benefits.trim())
      }

      return sections.join('\n')
    } catch (err) {
      console.error('상세 페이지 크롤링 실패:', err)
      return '상세 정보를 불러올 수 없습니다.'
    }
  }

  /**
   * 리소스 정리 (API 기반이라 브라우저 없음)
   */
  async close(): Promise<void> {
    // HTTP 클라이언트는 stateless이므로 정리할 것 없음
  }
}
