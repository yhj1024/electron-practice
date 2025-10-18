interface LogPanelProps {
  logs: string[]
}

export default function LogPanel({ logs }: LogPanelProps) {
  return (
    <div className="h-64 bg-slate-900 border-t border-slate-700 p-4 overflow-hidden flex flex-col">
      <h3 className="text-white font-semibold mb-2">실행 로그</h3>
      <div className="flex-1 bg-slate-950 rounded p-3 overflow-y-auto font-mono text-sm">
        {logs.length === 0 ? (
          <p className="text-slate-500">로그가 없습니다. 크롤링을 시작하세요.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="text-slate-300 py-1">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
