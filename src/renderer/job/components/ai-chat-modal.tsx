import { useState, useRef, useEffect } from 'react'
import Markdown from 'react-markdown'

interface AiChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface AiChatModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (prompt: string) => Promise<void>
  jobTitle: string
  company: string
  messages: AiChatMessage[]
  loading: boolean
}

export default function AiChatModal({
  isOpen,
  onClose,
  onSubmit,
  jobTitle,
  company,
  messages,
  loading,
}: AiChatModalProps) {
  const [prompt, setPrompt] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || loading) return

    await onSubmit(prompt)
    setPrompt('')
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onClick={handleClose}
    >
      <div
        className="bg-slate-800 rounded-lg shadow-2xl w-[900px] h-[80vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-slate-700 p-6 border-b border-slate-600 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">🤖 AI 채팅</h2>
              <p className="text-slate-300 font-semibold">{jobTitle}</p>
              <p className="text-slate-400 text-sm">{company}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-slate-500">
                <p className="text-lg mb-2">💬</p>
                <p>이 채용공고에 대해 궁금한 점을 물어보세요!</p>
                <p className="text-sm mt-2">예: 이 회사의 기술 스택은 무엇인가요?</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 border border-slate-700'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-white whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <div className="text-slate-300">
                        <Markdown
                          components={{
                            h2: ({ children }) => (
                              <h2 className="text-lg font-bold text-blue-400 mt-4 mb-2">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-base font-bold text-blue-300 mt-3 mb-2">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="text-slate-300 leading-relaxed mb-2">{children}</p>
                            ),
                            ul: ({ children }) => <ul className="list-disc ml-5 mb-2">{children}</ul>,
                            ol: ({ children }) => (
                              <ol className="list-decimal ml-5 mb-2">{children}</ol>
                            ),
                            li: ({ children }) => <li className="my-1">{children}</li>,
                            strong: ({ children }) => (
                              <strong className="text-white font-semibold">{children}</strong>
                            ),
                            code: ({ children }) => (
                              <code className="bg-slate-700 px-1.5 py-0.5 rounded text-purple-300 text-sm">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {message.content}
                        </Markdown>
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(message.timestamp).toLocaleTimeString('ko-KR')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* 입력 영역 */}
        <form onSubmit={handleSubmit} className="p-6 bg-slate-700 border-t border-slate-600 flex-shrink-0">
          <div className="flex gap-3">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={loading}
              placeholder="메시지를 입력하세요..."
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
              rows={2}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="px-6 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳' : '✨'}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">Shift + Enter로 줄바꿈</p>
        </form>
      </div>
    </div>
  )
}
