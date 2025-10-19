/**
 * 점핏 API 원본 공고 데이터
 */
export interface JumpitRawJob {
  id: number
  jobCategory: string
  logo?: string
  imagePath?: string
  title: string
  companyName: string
  techStacks?: string[]
  scrapCount?: number
  viewCount?: number
  newcomer: boolean
  minCareer: number
  maxCareer: number
  locations: string[]
  alwaysOpen: boolean
  closedAt?: string
  serialNumber: string
  encodedSerialNumber: string
  celebration?: number
  scraped: boolean
  applied: boolean
}

/**
 * 점핏 API 응답 타입
 */
export interface JumpitApiResponse {
  message: string
  status: number
  code: string
  result: {
    totalCount: number
    page: number
    keyword: string
    keywordType: string
    positions: JumpitRawJob[]
    emptyPosition: boolean
  }
}
