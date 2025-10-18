/**
 * 원티드 API 응답 데이터 구조
 * GET /api/chaos/navigation/v1/results
 */
export interface WantedRawJob {
  id: number // 공고 ID
  position: string // 직무명
  company: {
    id: number
    name: string
  }
  title_img: {
    origin?: string
    thumb?: string
    video?: string | null
  }
  address: {
    country: string
    location: string // 시/도 (예: 서울)
    district: string // 구 (예: 강남구)
  }
  annual_from: number // 최소 경력 (년)
  annual_to: number // 최대 경력 (년)
  employment_type: string // 고용 형태 (regular, contract 등)
  reward_total?: string // 보상금 (사용 안 함)
  is_bookmark?: boolean
}

/**
 * 원티드 API 응답 래퍼
 */
export interface WantedApiResponse {
  data: WantedRawJob[]
}
