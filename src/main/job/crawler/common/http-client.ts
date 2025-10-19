/**
 * HTTP 클라이언트 추상화
 * 모든 크롤러에서 공통으로 사용하는 HTTP 요청 유틸리티
 */

export interface HttpClientOptions {
  timeout?: number // 타임아웃 (ms)
  headers?: Record<string, string> // 커스텀 헤더
  retries?: number // 재시도 횟수
}

export class HttpClient {
  private defaultTimeout = 30000 // 30초
  private defaultRetries = 3

  /**
   * GET 요청 (JSON)
   */
  async get<T>(url: string, options: HttpClientOptions = {}): Promise<T> {
    const { timeout = this.defaultTimeout, headers = {}, retries = this.defaultRetries } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await this.fetchWithRetry(
        url,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            Accept: 'application/json',
            ...headers,
          },
          signal: controller.signal,
        },
        retries
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return (await response.json()) as T
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * GET 요청 (HTML/Text)
   */
  async getText(url: string, options: HttpClientOptions = {}): Promise<string> {
    const { timeout = this.defaultTimeout, headers = {}, retries = this.defaultRetries } = options

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await this.fetchWithRetry(
        url,
        {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            ...headers,
          },
          signal: controller.signal,
        },
        retries
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.text()
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * 재시도 로직이 포함된 fetch
   */
  private async fetchWithRetry(url: string, init: RequestInit, retries: number): Promise<Response> {
    let lastError: Error | null = null

    for (let i = 0; i <= retries; i++) {
      try {
        return await fetch(url, init)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // 마지막 시도가 아니면 대기 후 재시도
        if (i < retries) {
          const delay = Math.min(1000 * Math.pow(2, i), 10000) // exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw lastError || new Error('Unknown error during fetch')
  }
}

/**
 * 싱글톤 인스턴스
 */
export const httpClient = new HttpClient()
