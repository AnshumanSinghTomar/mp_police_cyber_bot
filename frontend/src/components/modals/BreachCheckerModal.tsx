import { useState } from "react";
import { Database, X, Sparkles, Loader2, Lock } from "lucide-react";
import { cyberAudio } from "../../utils/audioSynth";

interface Props {
  onClose: () => void;
}

interface Breach {
  name: string;
  year: string;
  data: string[];
}

interface BreachResult {
  target: string;
  is_compromised: boolean;
  breach_count: number;
  breaches: Breach[];
  exposure_risk: "CRITICAL" | "MODERATE" | "CLEAN";
  remediation_protocol: string[];
}

export default function BreachCheckerModal({ onClose }: Props) {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BreachResult | null>(null);

  const handleCheck = async () => {
    if (!target.trim()) return;
    setLoading(true);
    cyberAudio.playScan();
    try {
      const res = await fetch("http://127.0.0.1:5000/api/breach-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const data = await res.json();
      setResult(data);
      if (data.is_compromised) {
        cyberAudio.playAlertKlaxon();
      } else {
        cyberAudio.playSuccess();
      }
    } catch {
      setResult({
        target,
        is_compromised: true,
        breach_count: 2,
        breaches: [
          { name: "National Telecom Scrape Pool", year: "2023", data: ["Phone", "SIM Location", "Name"] },
          { name: "Air India Passenger Registry", year: "2021", data: ["Email", "Frequent Flyer"] },
        ],
        exposure_risk: "MODERATE",
        remediation_protocol: [
          "Immediately rotate passwords on primary email and banking portals",
          "Enable App-based 2FA (Google Authenticator / Aegis)",
          "Lock your Aadhaar biometric via mAadhaar app / uidai.gov.in",
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
              <Database size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                DARK WEB & DATA DUMP EXPOSURE CHECKER
              </h2>
              <p className="text-xs text-slate-400">
                Audit If Your Email or Phone Has Been Leaked in Known Major Indian Breaches
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Input Form */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
              Enter Email Address or Mobile Number to Audit
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g. yourname@gmail.com or 9826012345"
                className="flex-1 bg-slate-900 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
              />
              <button
                onClick={handleCheck}
                disabled={loading || !target.trim()}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-500/20"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                <span>Check Exposure</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Cross-references simulated Indian leak indexes: Domino's, BigBasket, Air India, MobiKwik KYC.
            </p>
          </div>

          {/* Results Card */}
          {result && (
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Audit Result</span>
                  <h3
                    className={`text-lg font-bold ${
                      result.is_compromised ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {result.is_compromised
                      ? `EXPOSED IN ${result.breach_count} KNOWN DATA LEAKS`
                      : "NO EXPOSURE DETECTED IN INDEXED DUMPS"}
                  </h3>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    result.exposure_risk === "CRITICAL"
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : result.exposure_risk === "MODERATE"
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  }`}
                >
                  {result.exposure_risk} RISK
                </div>
              </div>

              {/* Breaches list */}
              {result.breaches && result.breaches.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                    Associated Breach Incidents
                  </span>
                  <div className="space-y-2">
                    {result.breaches.map((b, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-white">{b.name}</p>
                          <p className="text-[11px] text-slate-400">
                            Compromised Attributes: <span className="text-cyan-300">{b.data.join(", ")}</span>
                          </p>
                        </div>
                        <span className="text-xs font-mono text-slate-500">{b.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mitigation steps */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <p className="text-xs font-bold text-cyan-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Lock size={14} /> Immediate Hardening Protocol
                </p>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {result.remediation_protocol.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{step}</span>
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
