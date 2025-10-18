import { useState, useEffect } from 'react'

interface JobPosting {
  id: string
  source: string
  title: string
  company: string
  url: string
  location?: string
  crawledAt: string
}

export default function JobTable() {
  const [savedJobs, setSavedJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSavedJobs()
  }, [])

  const loadSavedJobs = async () => {
    try {
      setLoading(true)
      const jobs = await window.api.getJobs()
      setSavedJobs(jobs)
    } catch (err) {
      console.error('공고 로드 실패:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 p-8 overflow-hidden flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">저장된 공고 조회</h2>
        <p className="text-slate-400 mt-2">
          {loading ? '로딩 중...' : `총 ${savedJobs.length}개의 공고`}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-900 rounded-lg">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-500">로딩 중...</p>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-500">저장된 공고가 없습니다.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-800 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                  출처
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                  회사명
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                  제목
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                  지역
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                  수집일
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">
                  링크
                </th>
              </tr>
            </thead>
            <tbody>
              {savedJobs.map(job => (
                <tr
                  key={job.id}
                  className="border-t border-slate-800 hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-slate-400">
                    <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded text-xs font-medium">
                      {job.source}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300 font-medium">
                    {job.company}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-200">{job.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{job.location}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(job.crawledAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      링크
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
