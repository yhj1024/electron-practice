import { useState } from 'react'
import LogPanel from '../components/log-panel'

export default function CrawlScreen() {
  const [loading, setLoading] = useState(false)
  const [jobCount, setJobCount] = useState<number | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ko-KR')
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  const handleCrawl = async () => {
    try {
      setLoading(true)
      setJobCount(null)
      setLogs([])

      addLog('🔍 크롤링 시작...')
      const jobs = await window.api.crawlWanted({
        locations: ['강남구', '관악구', '구로구', '금천구', '동작구', '서초구'],
      })

      addLog(`✅ ${jobs.length}개 공고 수집 완료`)
      addLog(`📁 JSON 파일 저장 완료`)
      setJobCount(jobs.length)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '알 수 없는 에러'
      addLog(`❌ 에러 발생: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <button
            onClick={handleCrawl}
            disabled={loading}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 shadow-2xl transition-all transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-4xl mb-1">{loading ? '⏳' : '🚀'}</div>
              <div className="text-white text-sm font-semibold">
                {loading ? '수집중...' : '시작'}
              </div>
            </div>
          </button>

          {jobCount !== null && (
            <div className="mt-8 p-6 bg-green-900/30 border border-green-700 rounded-lg inline-block">
              <p className="text-green-400 font-bold text-xl">✅ {jobCount}개 수집 완료!</p>
            </div>
          )}
        </div>
      </div>

      <LogPanel logs={logs} />
    </>
  )
}
