interface Props {
  score: number
}

export default function RiskMeter({ score }: Props) {

  // ✅ Clamp score between 0–100
  const safeScore = Math.max(0, Math.min(100, score || 0))

  // ✅ Dynamic color
  const getColor = () => {
    if (safeScore < 30) return "bg-green-500"
    if (safeScore < 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  // ✅ Risk Label
  const getLabel = () => {
    if (safeScore < 30) return "Low Risk"
    if (safeScore < 70) return "Medium Risk"
    return "High Risk"
  }

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-cyan-500/20 shadow-lg">

      <p className="text-sm mb-2 text-cyan-400 font-semibold">
        AI Threat Risk
      </p>

      <div className="w-full bg-slate-800 h-4 rounded overflow-hidden">
        <div
          className={`h-4 ${getColor()} transition-all duration-500`}
          style={{ width: `${safeScore}%` }}
        />
      </div>

      <div className="flex justify-between mt-2 text-xs">
        <span>{safeScore}%</span>
        <span className="opacity-70">{getLabel()}</span>
      </div>

    </div>
  )
}