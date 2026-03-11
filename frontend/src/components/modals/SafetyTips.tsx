export default function SafetyTips({ onClose }: any) {

  const tips = [
    "Never share OTP with anyone",
    "Avoid suspicious links & unknown APK files",
    "Enable Two-Factor Authentication (2FA)",
    "Use strong & unique passwords",
    "Verify payment requests before sending money"
  ]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">

      <div className="bg-slate-900 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] p-6 rounded-2xl w-[440px]">

        <h2 className="text-xl text-cyan-400 font-semibold mb-4 flex items-center gap-2">
          🚔 Cyber Safety Command Center
        </h2>

        {/* WARNING BOX */}
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">
          ⚠️ If money is lost in cyber fraud — immediately call <b>1930</b>
        </div>

        {/* SAFETY TIPS */}
        <div className="space-y-2 mb-4">
          {tips.map(t => (
            <div
              key={t}
              className="bg-slate-800/70 border border-slate-700 p-2 rounded text-sm"
            >
              🛡️ {t}
            </div>
          ))}
        </div>

        {/* OFFICIAL LINKS */}
        <div className="space-y-2 mb-4">

          <a
            href="https://sancharsathi.gov.in"
            target="_blank"
            className="block text-center bg-slate-800 hover:bg-cyan-500/20 border border-cyan-500/30 p-2 rounded"
          >
            📱 Report Lost Phone — sancharsathi.gov.in
          </a>

          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            className="block text-center bg-slate-800 hover:bg-cyan-500/20 border border-cyan-500/30 p-2 rounded"
          >
            🌐 Report Cyber Crime — cybercrime.gov.in
          </a>

          <a
            href="tel:1930"
            className="block text-center bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 p-2 rounded"
          >
            📞 Emergency Cyber Helpline — Dial 1930
          </a>

        </div>

        {/* ACTION BUTTON */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  )
}
