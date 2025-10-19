import Markdown from 'react-markdown'

interface AiResponseModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  company: string
  aiPrompt: string
  aiResponse: string
  aiRespondedAt: string
}

export default function AiResponseModal({
  isOpen,
  onClose,
  title,
  company,
  aiPrompt,
  aiResponse,
  aiRespondedAt,
}: AiResponseModalProps) {
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
              <h2 className="text-2xl font-bold text-white mb-2">🤖 AI 분석 결과</h2>
              <p className="text-slate-300 font-semibold">{title}</p>
              <p className="text-slate-400 text-sm">{company}</p>
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
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {/* 질문 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-400 font-bold">💬 질문</span>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <p className="text-slate-300 leading-relaxed">{aiPrompt}</p>
            </div>
          </div>

          {/* 답변 */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-purple-400 font-bold">✨ AI 답변</span>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
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
                  code: ({ children }) => (
                    <code className="bg-slate-800 px-1.5 py-0.5 rounded text-purple-300 text-sm">
                      {children}
                    </code>
                  ),
                }}
              >
                {aiResponse}
              </Markdown>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="bg-slate-700 p-4 border-t border-slate-600">
          <p className="text-xs text-slate-400">
            답변 생성 시각: {new Date(aiRespondedAt).toLocaleString('ko-KR')}
          </p>
        </div>
      </div>
    </div>
  )
}
