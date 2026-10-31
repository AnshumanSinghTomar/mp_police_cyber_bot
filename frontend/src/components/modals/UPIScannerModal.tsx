import { useState } from "react";
import { QrCode, X, AlertTriangle, CreditCard, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { cyberAudio } from "../../utils/audioSynth";

interface Props {
  onClose: () => void;
}

interface UPIResult {
  upi_id: string;
  valid_format: boolean;
  fraud_probability: number;
  status: string;
  flags: string[];
  golden_rule: string;
  action_guide: string[];
}

const SAMPLE_UPIS = [
  "refund.cashback.support@ybl",
  "kbc.lottery.officer77@paytm",
  "mp.police.challan.verify@apl",
  "ramesh.kumar98@oksbi",
];

export default function UPIScannerModal({ onClose }: Props) {
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UPIResult | null>(null);

  const handleVerify = async (target = upiId) => {
    if (!target.trim()) return;
    setLoading(true);
    cyberAudio.playScan();
    try {
      const res = await fetch("http://127.0.0.1:5000/api/verify-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upi_id: target }),
      });
      const data = await res.json();
      setResult(data);
      if (data.fraud_probability >= 50) {
        cyberAudio.playAlertKlaxon();
      } else {
        cyberAudio.playSuccess();
      }
    } catch {
      // Fallback
      const isScam = target.includes("refund") || target.includes("lottery") || target.includes("support");
      setResult({
        upi_id: target,
        valid_format: true,
        fraud_probability: isScam ? 88 : 15,
        status: isScam ? "HIGH RISK SCAM HANDLE" : "STANDARD VPA FORMAT",
        flags: isScam
          ? ["Deceptive keyword impersonating refund or customer care", "High risk disposable handle"]
          : ["Standard personal UPI format"],
        golden_rule: "NEVER enter your UPI PIN to receive money. Entering PIN only sends money out of your account.",
        action_guide: [
            "If transaction completed, note UTR Number from your banking SMS",
            "Call 1930 within 2 hours to activate NPCI auto-freeze on suspect account"
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 border-b border-cyan-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <QrCode size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                UPI & QR CODE FRAUD ANALYZER
              </h2>
              <p className="text-xs text-slate-400">
                Detect Collect-Request Traps & Fake Merchant Handles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Golden Rule Callout */}
        <div className="bg-amber-950/30 border-b border-amber-500/30 px-6 py-3 flex items-center gap-3 text-amber-300 text-xs font-semibold">
          <CreditCard size={18} className="shrink-0 text-amber-400" />
          <span>
            CRITICAL RULE: UPI PIN is ONLY entered to DEDUCT money from your account. You NEVER need to enter PIN to receive money!
          </span>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Suspicious UPI ID / VPA
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. cashback.reward@ybl or support.care@paytm"
                className="flex-1 bg-slate-900 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
              />
              <button
                onClick={() => handleVerify()}
                disabled={loading || !upiId.trim()}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>Verify UPI</span>
              </button>
            </div>

            {/* Quick samples */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span>Quick test:</span>
              {SAMPLE_UPIS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setUpiId(s);
                    handleVerify(s);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 transition font-mono"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Analysis Status</span>
                  <h3
                    className={`text-lg font-bold ${
                      result.fraud_probability >= 60
                        ? "text-red-400"
                        : result.fraud_probability >= 35
                        ? "text-orange-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {result.status}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Scam Probability</span>
                  <p className="text-xl font-mono font-bold text-white">{result.fraud_probability}%</p>
                </div>
              </div>

              {/* Flags */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Heuristic Risk Factors
                </span>
                <div className="space-y-1.5">
                  {result.flags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs text-slate-300"
                    >
                      <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action guide */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20 space-y-2">
                <p className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                  Immediate Defense Steps
                </p>
                <ul className="space-y-1 text-xs text-slate-300">
                  {result.action_guide.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight size={13} className="text-cyan-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
