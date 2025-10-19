import { useState } from 'react'

interface AiPromptModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (prompt: string) => Promise<void>
  jobTitle: string
  loading: boolean
}

export default function AiPromptModal({
  isOpen,
  onClose,
  onSubmit,
  jobTitle,
  loading,
}: AiPromptModalProps) {
  const [prompt, setPrompt] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || loading) return

    await onSubmit(prompt)
    setPrompt('')
  }

  const handleClose = () => {
    if (!loading) {
      setPrompt('')
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="bg-slate-800 rounded-lg shadow-2xl w-[600px] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-slate-700 p-6 border-b border-slate-600">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">🤖 AI에게 질문하기</h2>
              <p className="text-slate-300 text-sm">{jobTitle}</p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-slate-400 hover:text-white text-2xl font-bold disabled:opacity-50"
            >
              ×
            </button>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="prompt" className="block text-slate-300 mb-2 font-semibold">
              질문 내용
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={loading}
              placeholder="이 공고에 대해 궁금한 점을 입력하세요...&#10;예: 이 회사의 기술 스택은 무엇인가요?&#10;예: 신입 개발자에게 적합한 공고인가요?"
              className="w-full h-32 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-3 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="px-6 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ AI 답변 생성 중...' : '✨ 질문하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
