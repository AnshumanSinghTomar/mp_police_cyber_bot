interface Props {
  onFIR: () => void
  onTips: () => void
  onNearby: () => void
}

export default function Sidebar({ onFIR, onTips, onNearby }: Props) {

  return (
    <aside className="w-64 border-r border-cyan-500/20 bg-slate-950 p-4">

      <h1 className="text-cyan-400 text-xl font-semibold mb-6">
        MP Cyber Police
      </h1>

      <div className="flex flex-col gap-3">

        <button
          onClick={onFIR}
          className="p-3 rounded-lg border border-white/30 hover:border-cyan-400 text-left"
        >
          📄 File FIR
        </button>

        <button
          onClick={onTips}
          className="p-3 rounded-lg hover:bg-slate-800 text-left"
        >
          🛡️ Safety Tips
        </button>

        <button
          onClick={onNearby}
          className="p-3 rounded-lg hover:bg-slate-800 text-left"
        >
          📍 Nearby Police
        </button>

      </div>

    </aside>
  )
}
