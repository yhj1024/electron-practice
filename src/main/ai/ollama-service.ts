import type { OllamaConfig } from './types'

/**
 * 환경변수에서 Ollama 설정 로드
 * @throws {Error} 필수 환경변수가 없을 경우 에러 발생
 */
export function loadOllamaConfig(): OllamaConfig {
  const baseUrl = process.env.OLLAMA_BASE_URL
  const model = process.env.OLLAMA_MODEL
  const temperature = process.env.OLLAMA_TEMPERATURE

  // 필수 환경변수 검증
  if (!baseUrl) {
    throw new Error('환경변수 OLLAMA_BASE_URL이 설정되지 않았습니다')
  }

  if (!model) {
    throw new Error('환경변수 OLLAMA_MODEL이 설정되지 않았습니다')
  }

  return {
    baseUrl,
    model,
    temperature: temperature ? parseFloat(temperature) : 0,
    streaming: false,
  }
}

/**
 * Ollama 서비스 클래스
 *
 * 실제 AI 기능을 사용하려면 다음 패키지를 설치해야 합니다:
 * ```bash
 * pnpm add @langchain/ollama
 * ```
 *
 * 사용 예시:
 * ```typescript
 * import { ChatOllama } from '@langchain/ollama'
 *
 * const config = loadOllamaConfig()
 * const model = new ChatOllama(config)
 *
 * const response = await model.invoke('안녕하세요!')
 * console.log(response.content)
 * ```
 */
export class OllamaService {
  private config: OllamaConfig

  constructor() {
    this.config = loadOllamaConfig()
    console.log('🤖 Ollama 설정 로드 완료:', {
      baseUrl: this.config.baseUrl,
      model: this.config.model,
      temperature: this.config.temperature,
    })
  }

  /**
   * 현재 Ollama 설정 반환
   */
  getConfig(): OllamaConfig {
    return { ...this.config }
  }

  /**
   * AI 모델과 채팅 (스트리밍)
   * @param message 사용자 메시지
   * @param jobContext 채용공고 컨텍스트 (선택)
   * @param onChunk 스트리밍 청크 콜백
   */
  async chatStream(
    message: string,
    jobContext: string | undefined,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    try {
      const url = `${this.config.baseUrl}/api/generate`

      // 시스템 프롬프트 + 컨텍스트
      let fullPrompt = message
      if (jobContext) {
        fullPrompt = `당신은 채용공고 분석 전문가입니다. 반드시 한국어로 답변해주세요.

다음은 채용공고 정보입니다:

${jobContext}

사용자 질문: ${message}

위 채용공고 정보를 바탕으로 한국어로 상세하고 친절하게 답변해주세요.`
      } else {
        fullPrompt = `당신은 채용공고 분석 전문가입니다. 반드시 한국어로 답변해주세요.

사용자 질문: ${message}`
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: fullPrompt,
          stream: true, // 스트리밍 활성화
          options: {
            temperature: this.config.temperature,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Ollama API 요청 실패: ${response.status} ${response.statusText}`)
      }

      // 스트리밍 응답 처리
      let fullResponse = ''
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('응답 스트림을 읽을 수 없습니다.')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          try {
            const json = JSON.parse(line)
            if (json.response) {
              fullResponse += json.response
              onChunk(json.response) // 실시간으로 청크 전달
            }
          } catch (e) {
            // JSON 파싱 실패 무시
          }
        }
      }

      return fullResponse || '응답을 받지 못했습니다.'
    } catch (err) {
      console.error('AI 채팅 오류:', err)
      throw new Error(
        err instanceof Error ? err.message : 'AI 채팅 중 오류가 발생했습니다.'
      )
    }
  }

  /**
   * AI 모델과 채팅 (non-streaming, 하위 호환)
   * @param message 사용자 메시지
   * @param jobContext 채용공고 컨텍스트 (선택)
   */
  async chat(message: string, jobContext?: string): Promise<string> {
    return this.chatStream(message, jobContext, () => {
      // 스트리밍 무시
    })
  }
}
