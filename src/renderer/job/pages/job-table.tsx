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

interface JobPosting {
  id: string
  source: string
  title: string
  company: string
  url: string
  location?: string
  crawledAt: string
}

const initialFilters: JobFilterOptions = {
  searchText: '',
  source: '',
}

export default function JobTable() {
  const [savedJobs, setSavedJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<JobFilterOptions>(initialFilters)
  const [sorting, setSorting] = useState<SortingState>([])

  const tableContainerRef = useRef<HTMLDivElement>(null)

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
    []
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
    <div className="flex-1 p-8 overflow-hidden flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">저장된 공고 조회</h2>
        <p className="text-slate-400 mt-2">
          {loading ? '로딩 중...' : `총 ${savedJobs.length}개 중 ${filteredJobs.length}개 표시`}
        </p>
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
  )
}
