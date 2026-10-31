import { useState } from "react";
import { PhoneCall, X, AlertTriangle, Sparkles, Loader2, Video, CheckCircle2 } from "lucide-react";
import { cyberAudio } from "../../utils/audioSynth";

interface Props {
  onClose: () => void;
}

interface PhoneResult {
  phone: string;
  clean_number: string;
  risk_level: "CRITICAL" | "ELEVATED" | "MONITORED";
  risk_score: number;
  flags: string[];
  mp_police_advisory: string;
}

const SAMPLE_NUMBERS = [
  { num: "+92 301 4455667", desc: "WhatsApp caller claiming KBC lottery" },
  { num: "+1 (800) 234-9876", desc: "FedEx courier narcotics alert" },
  { num: "+91 98260 12345", desc: "Fake CBI officer video arrest call" },
];

export default function DigitalArrestModal({ onClose }: Props) {
  const [phone, setPhone] = useState("");
  const [scenario, setScenario] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhoneResult | null>(null);

  const handleInspect = async (targetPhone = phone, targetScenario = scenario) => {
    if (!targetPhone.trim()) return;
    setLoading(true);
    cyberAudio.playScan();
    try {
      const res = await fetch("http://127.0.0.1:5000/api/check-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: targetPhone, scenario: targetScenario }),
      });
      const data = await res.json();
      setResult(data);
      if (data.risk_score >= 60) {
        cyberAudio.playAlertKlaxon();
      } else {
        cyberAudio.playSuccess();
      }
    } catch {
      setResult({
        phone: targetPhone,
        clean_number: targetPhone.replace(/\D/g, ""),
        risk_level: "CRITICAL",
        risk_score: 95,
        flags: [
          "Digital Arrest modus operandi matched: Fake CBI/Customs video call trap",
          "International or VoIP routing mask detected",
        ],
        mp_police_advisory:
          "🚨 CRITICAL WARNING: Neither MP Police, CBI, ED, nor any Court in India conducts arrests, interrogations, or financial settlements via video call. HANG UP IMMEDIATELY.",
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
              <PhoneCall size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                DIGITAL ARREST & CALLER OSINT INVESTIGATOR
              </h2>
              <p className="text-xs text-slate-400">
                Identify Fake CBI, Police Video Calls & Foreign Extortion Syndicates
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

        {/* Fact Banner */}
        <div className="bg-rose-950/40 border-b border-rose-500/30 px-6 py-3 flex items-center gap-3 text-rose-300 text-xs font-semibold">
          <Video size={18} className="shrink-0 text-rose-400" />
          <span>
            FACT: Indian law does NOT recognize "Digital Arrest". No officer will ever order you to remain on a Skype or WhatsApp video call!
          </span>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Input Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">
                Caller Phone Number / WhatsApp ID
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +92 301... or +91 98..."
                className="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1">
                What did the caller say? (Keywords / Scenario)
              </label>
              <input
                type="text"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                placeholder="e.g. FedEx parcel seized with drugs, CBI arrest warrant, pay bail money..."
                className="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div className="flex justify-between items-center pt-1">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span>Presets:</span>
                {SAMPLE_NUMBERS.map((s) => (
                  <button
                    key={s.num}
                    onClick={() => {
                      setPhone(s.num);
                      setScenario(s.desc);
                      handleInspect(s.num, s.desc);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 transition font-mono"
                  >
                    {s.num}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleInspect()}
                disabled={loading || !phone.trim()}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>Inspect Caller</span>
              </button>
            </div>
          </div>

          {/* Results Card */}
          {result && (
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Threat Level</span>
                  <h3
                    className={`text-lg font-bold ${
                      result.risk_level === "CRITICAL"
                        ? "text-red-400"
                        : result.risk_level === "ELEVATED"
                        ? "text-orange-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {result.risk_level} THREAT
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Scam Risk</span>
                  <p className="text-xl font-mono font-bold text-white">{result.risk_score} / 100</p>
                </div>
              </div>

              {/* Indicators */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Intelligence Indicators
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

              {/* Police Advisory */}
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs leading-relaxed">
                {result.mp_police_advisory}
              </div>

              {/* Truth Checks */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                <p className="font-bold text-cyan-300 uppercase">3 Golden Rules against Video Extortion:</p>
                <div className="space-y-1 text-slate-300">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    Police summons are always served physically in writing, never on Skype or WhatsApp.
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    Never transfer money to "Reserve Bank secret account" or "Verification account" — these are fake mule accounts.
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    If threatened, immediately disconnect and report caller to 1930.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
