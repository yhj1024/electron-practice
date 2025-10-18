/**
 * 원티드 원본 데이터 구조
 * (실제 크롤링 결과 형식)
 */
export interface WantedRawJob {
  id: string // 공고 ID
  title: string // 공고 제목
  company: string // 회사명
  imageUrl?: string // 공고 이미지 URL
  location: string // 근무지
  experience?: string // 경력 요구사항
  employmentType?: string // 고용 형태 (정규직, 계약직 등)
  url: string // 공고 URL
}
