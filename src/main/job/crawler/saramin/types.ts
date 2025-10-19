/**
 * 사람인 원본 채용 공고 데이터 타입
 * HTML 파싱 결과를 저장하는 구조
 */
export interface SaraminRawJob {
  /**
   * 채용공고 ID (rec_idx)
   */
  id: string

  /**
   * 채용공고 제목
   */
  title: string

  /**
   * 회사명
   */
  company: string

  /**
   * 근무 지역
   */
  location: string

  /**
   * 직무 분야 (예: 백엔드/서버개발, 프론트엔드개발 등)
   */
  sectors: string[]

  /**
   * 경력 조건 (예: 신입, 경력, 3년 이상 등)
   */
  experience: string

  /**
   * 마감일 (예: ~10.31(금))
   */
  deadline: string

  /**
   * 채용공고 URL
   */
  url: string
}
