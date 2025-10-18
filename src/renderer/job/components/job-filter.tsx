export interface JobFilterOptions {
  searchText: string
  source: string
}

interface JobFilterProps {
  filters: JobFilterOptions
  onFilterChange: (filters: JobFilterOptions) => void
  onReset: () => void
}

export default function JobFilter({ filters, onFilterChange, onReset }: JobFilterProps) {
  const updateFilter = (key: keyof JobFilterOptions, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  return (
    <div className="bg-slate-900 rounded-lg p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 검색어 */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-300 mb-2">제목 검색</label>
          <input
            type="text"
            value={filters.searchText}
            onChange={e => updateFilter('searchText', e.target.value)}
            placeholder="공고 제목으로 검색"
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 출처 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">출처</label>
          <select
            value={filters.source}
            onChange={e => updateFilter('source', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체</option>
            <option value="wanted">원티드</option>
            <option value="saramin">사람인</option>
            <option value="jumpit">점핏</option>
          </select>
        </div>
      </div>

      {/* 초기화 버튼 - 필터 적용 시에만 표시 */}
      {(filters.searchText || filters.source) && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onReset}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition-colors text-sm"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  )
}
