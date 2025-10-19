/**
 * 채용 사이트 소스
 */
export type JobSource = 'wanted' | 'saramin' | 'jumpit'

/**
 * 채용 공고 제한 사항 (경력, 학력 등)
 */
export interface JobRequirements {
  experience?: string // 경력 (예: "신입", "경력 3년 이상")
  education?: string // 학력 (예: "대졸 이상")
  employmentType?: string // 고용 형태 (예: "정규직", "계약직")
}

/**
 * 통일된 채용 공고 형식
 */
export interface JobPosting {
  // 필수 필드
  id: string // 고유 ID (예: wanted-123456)
  source: JobSource // 출처 사이트 (wanted, saramin, jumpit)
  title: string // 공고 제목
  company: string // 회사명
  url: string // 원본 URL (클릭 시 이동할 링크)

  // 선택 필드
  imageUrl?: string // 공고 썸네일 이미지 URL
  location?: string // 근무 지역 (예: "서울 강남구")
  requirements?: JobRequirements // 제한 사항 (경력, 학력 등)

  // 메타데이터
  crawledAt: string // 크롤링 시각 (ISO 8601)
  rawData?: unknown // 원본 데이터 (디버깅/재처리용)
  detailContent?: string // 상세 내용 (HTML 또는 텍스트)
  detailLoadedAt?: string // 상세 내용 로드 시각 (ISO 8601)

  // AI 분석
  aiPrompt?: string // AI에게 보낸 프롬프트 (deprecated - aiMessages 사용)
  aiResponse?: string // AI 응답 내용 (deprecated - aiMessages 사용)
  aiRespondedAt?: string // AI 응답 시각 (deprecated - aiMessages 사용)
  aiMessages?: AiChatMessage[] // AI 채팅 히스토리
  aiLastReadAt?: string // 마지막으로 채팅을 읽은 시각
}

/**
 * AI 채팅 메시지
 */
export interface AiChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

/**
 * 크롤러 공통 옵션
 */
export interface CrawlerOptions {
  keywords?: string[] // 검색 키워드
  locations?: string[] // 지역 필터
  experience?: string // 경력 필터
  limit?: number // 최대 결과 수
}

/**
 * 크롤러 인터페이스
 * 모든 크롤러는 이 인터페이스를 구현해야 함
 */
export interface ICrawler<TRawData = unknown> {
  /**
   * 채용 공고 목록 크롤링
   * @param options 크롤링 옵션
   * @returns 원본 데이터 배열
   */
  fetchJobList(options?: CrawlerOptions): Promise<TRawData[]>

  /**
   * 특정 공고의 상세 내용 크롤링
   * @param url 공고 상세 페이지 URL
   * @returns 상세 내용 (HTML 또는 텍스트)
   */
  fetchJobDetail?(url: string): Promise<string>

  /**
   * 브라우저 인스턴스 종료
   */
  close(): Promise<void>
}

/**
 * 어댑터 인터페이스
 * 사이트별 원본 데이터를 통일된 형식으로 변환
 */
export interface IAdapter<TRawData> {
  /**
   * 원본 데이터를 통일된 JobPosting 형식으로 변환
   * @param rawData 사이트별 원본 데이터
   * @returns 통일된 채용 공고 객체
   */
  adapt(rawData: TRawData): JobPosting
}
