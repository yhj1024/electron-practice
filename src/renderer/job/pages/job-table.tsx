import { useState, useEffect, useMemo, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import JobFilter, { JobFilterOptions } from '../components/job-filter'
import JobDetailModal from '../components/job-detail-modal'
import AiChatModal from '../components/ai-chat-modal'

interface AiChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface JobPosting {
  id: string
  source: string
  title: string
  company: string
  url: string
  location?: string
  crawledAt: string
  detailContent?: string
  detailLoadedAt?: string
  aiPrompt?: string
  aiResponse?: string
  aiRespondedAt?: string
  aiMessages?: AiChatMessage[]
  aiLastReadAt?: string
  requirements?: {
    experience?: string
  }
}

const initialFilters: JobFilterOptions = {
  searchText: '',
  source: '',
}

export default function JobTable() {
  const [savedJobs, setSavedJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [filters, setFilters] = useState<JobFilterOptions>(initialFilters)
  const [sorting, setSorting] = useState<SortingState>([])
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [aiChatJob, setAiChatJob] = useState<JobPosting | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiProcessingJobId, setAiProcessingJobId] = useState<string | null>(null) // AI 작업 중인 공고 ID

  const tableContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadSavedJobs()

    // 상세 내용 로드 이벤트 리스너 등록
    window.api.onJobDetailLoaded((updatedJob: JobPosting) => {
      setSavedJobs(prev => prev.map(job => (job.id === updatedJob.id ? updatedJob : job)))
    })

    window.api.onJobDetailsCompleted(() => {
      setLoadingDetails(false)
      console.log('✅ 모든 상세 내용 로드 완료')
    })

    window.api.onJobDetailsStopped(() => {
      setLoadingDetails(false)
      console.log('⏹️ 상세 내용 로드 중단됨')
    })

    // AI 채팅 스트리밍 청크 이벤트 리스너
    window.api.onAiChatChunk(({ jobId, chunk }) => {
      setSavedJobs(prev =>
        prev.map(job => {
          if (job.id !== jobId) return job

          const messages = job.aiMessages || []
          const lastMessage = messages[messages.length - 1]

          // 마지막 메시지가 assistant이면 업데이트, 아니면 새로 추가
          if (lastMessage && lastMessage.role === 'assistant') {
            const updatedMessages = [...messages]
            updatedMessages[updatedMessages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + chunk,
            }
            return { ...job, aiMessages: updatedMessages }
          } else {
            // 첫 청크: assistant 메시지 새로 추가
            const newMessage = {
              role: 'assistant' as const,
              content: chunk,
              timestamp: new Date().toISOString(),
            }
            return { ...job, aiMessages: [...messages, newMessage] }
          }
        })
      )

      // 모달이 열려있으면 업데이트
      setAiChatJob(prev => {
        if (!prev || prev.id !== jobId) return prev

        const messages = prev.aiMessages || []
        const lastMessage = messages[messages.length - 1]

        if (lastMessage && lastMessage.role === 'assistant') {
          const updatedMessages = [...messages]
          updatedMessages[updatedMessages.length - 1] = {
            ...lastMessage,
            content: lastMessage.content + chunk,
          }
          return { ...prev, aiMessages: updatedMessages }
        } else {
          // 첫 청크: assistant 메시지 새로 추가
          const newMessage = {
            role: 'assistant' as const,
            content: chunk,
            timestamp: new Date().toISOString(),
          }
          return { ...prev, aiMessages: [...messages, newMessage] }
        }
      })
    })
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

  // 상세 크롤링 시작
  const handleLoadDetails = async () => {
    try {
      setLoadingDetails(true)
      await window.api.loadJobDetails()
    } catch (err) {
      console.error('상세 크롤링 실패:', err)
      setLoadingDetails(false)
    }
  }

  // 상세 크롤링 중단
  const handleStopDetails = async () => {
    try {
      await window.api.stopJobDetails()
    } catch (err) {
      console.error('크롤링 중단 실패:', err)
    }
  }

  // AI 채팅 열기
  const handleOpenAiChat = (job: JobPosting) => {
    setAiChatJob(job)
  }

  // AI 질문 제출
  const handleAiSubmit = async (prompt: string) => {
    if (!aiChatJob) return

    const jobId = aiChatJob.id
    const timestamp = new Date().toISOString()

    // 1. 즉시 user 메시지만 추가
    const userMessage = { role: 'user' as const, content: prompt, timestamp }
    const optimisticMessages = [...(aiChatJob.aiMessages || []), userMessage]

    const optimisticJob = {
      ...aiChatJob,
      aiMessages: optimisticMessages,
    }

    // 2. 로컬 상태 즉시 업데이트
    setSavedJobs(prev => prev.map(job => (job.id === jobId ? optimisticJob : job)))
    setAiChatJob(optimisticJob)

    // 3. AI 작업 중 표시
    setAiProcessingJobId(jobId)

    // 4. 모달 유지 (AI 응답 볼 수 있도록)

    // 5. 백그라운드에서 AI 스트리밍 응답 받기
    try {
      setAiLoading(true)
      const result = await window.api.aiChat(jobId, prompt)

      if (result.success && result.job) {
        // 6. AI 응답 완료 → 최종 상태 업데이트
        setSavedJobs(prev => prev.map(job => (job.id === result.job!.id ? result.job! : job)))

        // 7. AI 작업 완료 표시 제거 및 팝업 자동으로 열기
        setAiProcessingJobId(null)
        setAiChatJob(result.job)
      } else {
        alert(`❌ ${result.error || 'AI 요청 실패'}`)
        setAiProcessingJobId(null)
      }
    } catch (err) {
      console.error('AI 질문 실패:', err)
      alert('AI 질문 중 오류가 발생했습니다.')
      setAiProcessingJobId(null)
    } finally {
      setAiLoading(false)
    }
  }

  // 필터링된 공고 목록
  const filteredJobs = useMemo(() => {
    return savedJobs.filter(job => {
      // 검색어 필터 (제목만)
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase()
        const titleMatch = job.title.toLowerCase().includes(searchLower)
        if (!titleMatch) return false
      }

      // 출처 필터
      return !(filters.source && job.source !== filters.source)
    })
  }, [savedJobs, filters])

  const handleFilterReset = () => {
    setFilters(initialFilters)
  }

  // 컬럼 정의
  const columns = useMemo<ColumnDef<JobPosting>[]>(
    () => [
      {
        accessorKey: 'source',
        header: '출처',
        cell: info => {
          const source = info.getValue() as string
          const colorClass =
            source === 'wanted'
              ? 'bg-blue-900/50 text-pink-400' // 원티드: 하늘색 배경 + 분홍색 글자
              : source === 'jumpit'
                ? 'bg-green-900/50 text-green-300' // 점핏: 초록색
                : 'bg-orange-900/50 text-orange-300' // 사람인: 오렌지

          return (
            <span className={`px-2 py-1 ${colorClass} rounded text-xs font-medium`}>{source}</span>
          )
        },
        size: 100,
      },
      {
        accessorKey: 'company',
        header: '회사명',
        cell: info => (
          <span className="text-slate-300 font-medium">{info.getValue() as string}</span>
        ),
        size: 150,
      },
      {
        accessorKey: 'title',
        header: '제목',
        cell: info => <span className="text-slate-200">{info.getValue() as string}</span>,
        size: 500,
      },
      {
        accessorKey: 'location',
        header: '지역',
        cell: info => <span className="text-slate-400">{info.getValue() as string}</span>,
        size: 120,
      },
      {
        id: 'experience',
        header: '경력',
        cell: ({ row }) => (
          <span className="text-slate-400 text-xs">
            {row.original.requirements?.experience || '-'}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: 'crawledAt',
        header: '수집일',
        cell: info => (
          <span className="text-slate-500">
            {new Date(info.getValue() as string).toLocaleDateString('ko-KR')}
          </span>
        ),
        size: 120,
      },
      {
        id: 'detail',
        header: '상세보기',
        cell: ({ row }) => {
          const hasDetail = !!row.original.detailContent
          return (
            <button
              onClick={() => hasDetail && setSelectedJob(row.original)}
              disabled={!hasDetail}
              className={`text-lg font-bold ${
                hasDetail
                  ? 'text-green-500 cursor-pointer hover:text-green-400'
                  : 'text-red-500 cursor-not-allowed'
              }`}
            >
              {hasDetail ? '✓' : '✗'}
            </button>
          )
        },
        size: 100,
      },
      {
        id: 'ai',
        header: 'AI',
        cell: ({ row }) => {
          const messages = row.original.aiMessages || []
          const hasMessages = messages.length > 0
          const isProcessing = aiProcessingJobId === row.original.id

          return (
            <div className="relative">
              <button
                onClick={() => handleOpenAiChat(row.original)}
                className={`text-2xl ${
                  hasMessages
                    ? 'text-purple-500 hover:text-purple-400'
                    : 'text-slate-500 hover:text-slate-400'
                } cursor-pointer`}
                title={hasMessages ? 'AI 채팅 보기' : 'AI 채팅 시작'}
              >
                💬
              </button>
              {isProcessing && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg animate-pulse z-50">
                  답변 중...
                </div>
              )}
            </div>
          )
        },
        size: 80,
      },
      {
        id: 'link',
        header: '링크',
        cell: ({ row }) => (
          <a
            href={row.original.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 hover:underline"
          >
            링크
          </a>
        ),
        size: 80,
      },
    ],
    [aiProcessingJobId]
  )

  // TanStack Table 설정
  const table = useReactTable({
    data: filteredJobs,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { rows } = table.getRowModel()

  // Virtual 스크롤 설정
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48, // 행 높이 (px)
    overscan: 10, // 화면 밖에 미리 렌더링할 행 수
  })

  return (
    <>
      {/* 상세보기 모달 */}
      {selectedJob && (
        <JobDetailModal
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={selectedJob.title}
          company={selectedJob.company}
          detailContent={selectedJob.detailContent || ''}
          detailLoadedAt={selectedJob.detailLoadedAt || ''}
        />
      )}

      {/* AI 채팅 모달 */}
      {aiChatJob && (
        <AiChatModal
          isOpen={!!aiChatJob}
          onClose={() => setAiChatJob(null)}
          onSubmit={handleAiSubmit}
          jobTitle={aiChatJob.title}
          company={aiChatJob.company}
          messages={aiChatJob.aiMessages || []}
          loading={aiLoading}
        />
      )}

      <div className="flex-1 p-8 overflow-hidden flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">저장된 공고 조회</h2>
          <p className="text-slate-400 mt-2">
            {loading ? '로딩 중...' : `총 ${savedJobs.length}개 중 ${filteredJobs.length}개 표시`}
          </p>
        </div>

        {/* 상세 크롤링 버튼 */}
        <div className="flex gap-3">
          {!loadingDetails ? (
            <button
              onClick={handleLoadDetails}
              disabled={savedJobs.length === 0}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                savedJobs.length === 0
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              📥 상세 내용 크롤링 시작
            </button>
          ) : (
            <>
              <div className="px-6 py-3 bg-slate-700 text-slate-300 rounded-lg font-semibold">
                ⏳ 상세 내용 로딩 중...
              </div>
              <button
                onClick={handleStopDetails}
                className="px-6 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                ⏹️ 중단
              </button>
            </>
          )}
        </div>
      </div>

      <JobFilter filters={filters} onFilterChange={setFilters} onReset={handleFilterReset} />

      <div
        ref={tableContainerRef}
        className="flex-1 overflow-auto bg-slate-900 rounded-lg"
        style={{ contain: 'strict' }}
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-500">로딩 중...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-500">
              {savedJobs.length === 0 ? '저장된 공고가 없습니다.' : '조건에 맞는 공고가 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="w-full">
            {/* Header */}
            <div className="bg-slate-800 sticky top-0 z-10 flex">
              {table.getHeaderGroups()[0].headers.map(header => (
                <div
                  key={header.id}
                  className="px-4 py-3 text-left text-sm font-semibold text-slate-300 select-none"
                  style={{ width: header.getSize(), flexShrink: 0 }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={
                        header.column.getCanSort()
                          ? 'cursor-pointer hover:text-white flex items-center gap-2'
                          : ''
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Virtual rows */}
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map(virtualRow => {
                const row = rows[virtualRow.index]
                return (
                  <div
                    key={row.id}
                    className="border-t border-slate-800 hover:bg-slate-800/50 transition-colors flex"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {row.getVisibleCells().map(cell => (
                      <div
                        key={cell.id}
                        className="px-4 py-3 text-sm"
                        style={{ width: cell.column.getSize(), flexShrink: 0 }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
