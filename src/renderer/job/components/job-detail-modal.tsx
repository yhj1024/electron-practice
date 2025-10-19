import Markdown from 'react-markdown'

interface JobDetailModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  company: string
  detailContent: string
  detailLoadedAt: string
}

export default function JobDetailModal({
  isOpen,
  onClose,
  title,
  company,
  detailContent,
  detailLoadedAt,
}: JobDetailModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-lg shadow-2xl w-[800px] max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-slate-700 p-6 border-b border-slate-600">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
              <p className="text-slate-300">{company}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)] text-slate-300">
          <Markdown
            components={{
              h2: ({ children }) => (
                <h2 className="text-xl font-bold text-blue-400 mt-6 mb-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-bold text-blue-300 mt-4 mb-2">{children}</h3>
              ),
              p: ({ children }) => <p className="text-slate-300 leading-relaxed mb-3">{children}</p>,
              ul: ({ children }) => <ul className="list-disc ml-5 mb-3">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal ml-5 mb-3">{children}</ol>,
              li: ({ children }) => <li className="my-1">{children}</li>,
              strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
              em: ({ children }) => <em className="text-slate-200 italic">{children}</em>,
            }}
          >
            {detailContent}
          </Markdown>
        </div>

        {/* 푸터 */}
        <div className="bg-slate-700 p-4 border-t border-slate-600">
          <p className="text-xs text-slate-400">
            로드 시각: {new Date(detailLoadedAt).toLocaleString('ko-KR')}
          </p>
        </div>
      </div>
    </div>
  )
}
