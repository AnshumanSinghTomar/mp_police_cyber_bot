interface Props { score: number }

export default function RiskMeter({ score }: Props) {
  const s = Math.max(0, Math.min(100, score || 0))

  const color =
    s < 30 ? { bar: "#22c55e", text: "text-green-400",  glow: "rgba(34,197,94,0.4)"  } :
    s < 70 ? { bar: "#eab308", text: "text-yellow-400", glow: "rgba(234,179,8,0.4)"  } :
             { bar: "#ef4444", text: "text-red-400",    glow: "rgba(239,68,68,0.4)"  }

  const label = s < 30 ? "Low Risk" : s < 70 ? "Medium Risk" : "High Risk"

  return (
    <div className="risk-meter-wrap">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-cyan-400 font-semibold tracking-wider uppercase">AI Threat Risk</span>
        <span className={`text-xs font-bold ${color.text}`}>{label} — {s}%</span>
      </div>

      <div className="risk-track">
        <div
          className="risk-bar"
          style={{
            width:      `${s}%`,
            background: color.bar,
            boxShadow:  `0 0 8px ${color.glow}`,
          }}
        />
      </div>

      {/* tick marks */}
      <div className="flex justify-between mt-1 text-[9px] text-slate-600 px-0.5">
        <span>0</span>
        <span>LOW</span>
        <span>MED</span>
        <span>HIGH</span>
        <span>100</span>
      </div>
    </div>
  )
}
