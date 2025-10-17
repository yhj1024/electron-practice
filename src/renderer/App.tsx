export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="max-w-3xl p-8 bg-slate-800 rounded-2xl border border-slate-700">
        <h1 className="text-4xl font-bold text-white mb-4">Electron Saju</h1>
        <p className="text-slate-400 mb-6">React + Electron + TypeScript + Tailwind CSS</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-700 rounded-lg">
            <h3 className="text-white font-semibold">Electron 38</h3>
          </div>
          <div className="p-4 bg-slate-700 rounded-lg">
            <h3 className="text-white font-semibold">React 19</h3>
          </div>
        </div>
      </div>
    </div>
  )
}
