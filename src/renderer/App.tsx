import { useState } from 'react'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [jobCount, setJobCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCrawl = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('크롤링 시작...')
      const jobs = await window.api.crawlWanted({
        locations: ['강남구', '관악구', '구로구', '금천구', '동작구', '서초구'],
        // 서울 주요 지역 전체
      })

      console.log(`${jobs.length}개 공고 수집 완료:`, jobs)
      setJobCount(jobs.length)
    } catch (err) {
      console.error('크롤링 실패:', err)
      setError(err instanceof Error ? err.message : '알 수 없는 에러')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full p-8 bg-slate-800 rounded-2xl border border-slate-700">
        <h1 className="text-4xl font-bold text-white mb-2">Electron Saju</h1>
        <p className="text-slate-400 mb-6">채용 공고 크롤러 테스트</p>

        <div className="space-y-4">
          {/* 크롤링 버튼 */}
          <button
            onClick={handleCrawl}
            disabled={loading}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? '크롤링 중...' : '원티드 크롤링 시작 (서울 6개구 전체)'}
          </button>

          {/* 결과 표시 */}
          {jobCount !== null && (
            <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
              <p className="text-green-400 font-semibold">✅ {jobCount}개 공고 수집 완료!</p>
              <p className="text-green-300 text-sm mt-2">
                JSON 파일이 생성되었습니다. DevTools 콘솔을 확인하세요.
              </p>
            </div>
          )}

          {/* 에러 표시 */}
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400 font-semibold">❌ 에러 발생</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* 정보 */}
          <div className="p-4 bg-slate-700 rounded-lg">
            <h3 className="text-white font-semibold mb-2">저장 경로</h3>
            <p className="text-slate-300 text-sm font-mono">
              ~/Library/Application Support/electron-practice/jobs/
            </p>
            <ul className="mt-2 text-slate-400 text-sm space-y-1">
              <li>• wanted-raw.json - 원본 API 응답</li>
              <li>• normalized.json - 통일된 형식</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
