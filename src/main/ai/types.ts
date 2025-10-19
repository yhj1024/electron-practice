/**
 * AI 모델 설정 타입
 */
export interface OllamaConfig {
  /** Ollama 서버 기본 URL */
  baseUrl: string
  /** 사용할 모델 이름 */
  model: string
  /** 응답의 랜덤성 (0 = 결정적, 2 = 창의적) */
  temperature: number
  /** 스트리밍 응답 여부 */
  streaming?: boolean
}

/**
 * AI 채팅 메시지 타입
 */
export interface ChatMessage {
  /** 메시지 역할 */
  role: 'user' | 'assistant' | 'system'
  /** 메시지 내용 */
  content: string
}

/**
 * AI 응답 타입
 */
export interface ChatResponse {
  /** 응답 내용 */
  content: string
  /** 응답 생성 시각 */
  timestamp: string
  /** 사용된 토큰 수 (선택적) */
  tokens?: number
}
