import { useState, useEffect } from "react";
import { Radar, X, Radio, MapPin, AlertTriangle, RefreshCw } from "lucide-react";
import { cyberAudio } from "../../utils/audioSynth";

interface Props {
  onClose: () => void;
}

interface DistrictThreat {
  id: string;
  name: string;
  threat_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  score: number;
  active_scam: string;
  intercepted_today: number;
  lat: number;
  lng: number;
}

const DEFAULT_DISTRICTS: DistrictThreat[] = [
  {
    id: "bhopal",
    name: "Bhopal (Cyber HQ)",
    threat_level: "HIGH",
    score: 86,
    active_scam: "Fake MP Electricity Bill WhatsApp APK & Fake E-Challan APKs",
    intercepted_today: 142,
    lat: 23.2599,
    lng: 77.4126,
  },
  {
    id: "indore",
    name: "Indore (Tech Hub)",
    threat_level: "CRITICAL",
    score: 92,
    active_scam: "Institutional Share Market / IPO Allotment WhatsApp Syndicate",
    intercepted_today: 218,
    lat: 22.7196,
    lng: 75.8577,
  },
  {
    id: "gwalior",
    name: "Gwalior",
    threat_level: "MEDIUM",
    score: 68,
    active_scam: "Army Vehicle OLX Advance Token Scam & Smishing OTP Theft",
    intercepted_today: 79,
    lat: 26.2183,
    lng: 78.1828,
  },
  {
    id: "jabalpur",
    name: "Jabalpur",
    threat_level: "HIGH",
    score: 78,
    active_scam: "Digital Arrest Extortion (Fake High Court / FedEx Narcotics Call)",
    intercepted_today: 113,
    lat: 23.1815,
    lng: 79.9864,
  },
  {
    id: "ujjain",
    name: "Ujjain",
    threat_level: "MEDIUM",
    score: 64,
    active_scam: "Fake Mahakal VIP Darshan & Fake Dharamshala Booking Portals",
    intercepted_today: 58,
    lat: 23.1765,
    lng: 75.7885,
  },
  {
    id: "sagar",
    name: "Sagar",
    threat_level: "LOW",
    score: 42,
    active_scam: "KBC Lottery WhatsApp Scratch Card Call",
    intercepted_today: 31,
    lat: 23.8388,
    lng: 78.7378,
  },
  {
    id: "rewa",
    name: "Rewa",
    threat_level: "MEDIUM",
    score: 58,
    active_scam: "Online Part-Time YouTube Video Liking Job Fraud",
    intercepted_today: 47,
    lat: 24.5362,
    lng: 81.3037,
  },
];

export default function ThreatRadarModal({ onClose }: Props) {
  const [districts, setDistricts] = useState<DistrictThreat[]>(DEFAULT_DISTRICTS);
  const [selectedId, setSelectedId] = useState<string>("bhopal");
  const [loading, setLoading] = useState(false);
  const [totalIntercepts, setTotalIntercepts] = useState(688);

  const selected = districts.find((d) => d.id === selectedId) || districts[0];

  const fetchThreats = async () => {
    setLoading(true);
    cyberAudio.playRadarPing();
    try {
      const res = await fetch("http://127.0.0.1:5000/api/live-threats");
      if (res.ok) {
        const data = await res.json();
        if (data.districts) {
          setDistricts(data.districts);
          setTotalIntercepts(data.total_intercepted_today);
        }
      }
    } catch {
      // Use fallback data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThreats();
    const interval = setInterval(() => {
      setTotalIntercepts((prev) => prev + Math.floor(Math.random() * 3));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-900/90 border-b border-cyan-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Radar size={24} className="animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  MP CYBER DEFENSE RADAR & THREAT HEATMAP
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                  LIVE INTERCEPT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Statewide Tactical Telemetry • Madhya Pradesh Police Cyber Command
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchThreats}
              disabled={loading}
              title="Refresh radar stream"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/20 transition disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tactical Bar */}
        <div className="grid grid-cols-4 bg-slate-900/50 border-b border-cyan-500/10 px-6 py-2.5 text-xs">
          <div>
            <span className="text-slate-500 text-[10px] uppercase">State Threat Index</span>
            <p className="text-cyan-300 font-mono font-bold">DEFCON 2 (ELEVATED)</p>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Scams Intercepted (Today)</span>
            <p className="text-emerald-400 font-mono font-bold">{totalIntercepts} ATTEMPTS</p>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">Hotline 1930 Status</span>
            <p className="text-green-400 font-mono font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" /> ONLINE (24x7)
            </p>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase">High Risk Sectors</span>
            <p className="text-amber-400 font-mono font-bold">INDORE / BHOPAL</p>
          </div>
        </div>

        {/* Content Body: Grid Radar & Details */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
          {/* Left Column: Simulated Radar Sweep Visualizer */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-900/70 border border-cyan-500/20 rounded-2xl relative overflow-hidden">
            {/* Circular Radar Visual */}
            <div className="relative w-64 h-64 rounded-full border border-cyan-500/40 flex items-center justify-center bg-cyan-950/20 shadow-inner">
              {/* Concentric rings */}
              <div className="w-48 h-48 rounded-full border border-cyan-500/30" />
              <div className="w-32 h-32 rounded-full border border-cyan-500/20" />
              <div className="w-16 h-16 rounded-full border border-cyan-500/20" />
              {/* Crosshairs */}
              <div className="absolute inset-x-0 h-px bg-cyan-500/30" />
              <div className="absolute inset-y-0 w-px bg-cyan-500/30" />

              {/* Radar Sweep Line */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(6,182,212,0.4) 0deg, rgba(6,182,212,0.05) 60deg, transparent 65deg)",
                  animation: "radarSweep 4s linear infinite",
                }}
              />

              {/* District Blips on Radar */}
              {districts.map((d) => {
                const isSelected = d.id === selectedId;
                // Pseudo positions for the visual radar
                const offsets: Record<string, { top: string; left: string }> = {
                  bhopal: { top: "48%", left: "48%" },
                  indore: { top: "60%", left: "30%" },
                  gwalior: { top: "20%", left: "55%" },
                  jabalpur: { top: "55%", left: "68%" },
                  ujjain: { top: "52%", left: "22%" },
                  sagar: { top: "38%", left: "60%" },
                  rewa: { top: "35%", left: "78%" },
                };
                const pos = offsets[d.id] || { top: "50%", left: "50%" };

                return (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedId(d.id);
                      cyberAudio.playRadarPing();
                    }}
                    style={{ top: pos.top, left: pos.left }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10`}
                  >
                    <span
                      className={`block w-3.5 h-3.5 rounded-full ${
                        d.threat_level === "CRITICAL"
                          ? "bg-red-500 shadow-red-500 shadow-lg animate-ping"
                          : d.threat_level === "HIGH"
                          ? "bg-orange-500 shadow-orange-500 animate-pulse"
                          : "bg-cyan-400"
                      } ${isSelected ? "ring-4 ring-white" : ""}`}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 hidden group-hover:block whitespace-nowrap bg-black/90 text-[10px] text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                      {d.name} ({d.score}%)
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-[11px] text-slate-400 text-center flex items-center gap-1.5">
              <Radio size={12} className="text-red-400 animate-pulse" /> Click any blip or district tab to inspect
            </p>
          </div>

          {/* Right Column: District Heatmap Telemetry */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {/* District Selector Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {districts.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedId(d.id);
                    cyberAudio.playBlip();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    selectedId === d.id
                      ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {d.name.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Selected District Card */}
            <div className="p-5 bg-slate-900/80 border border-cyan-500/30 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MapPin size={18} className="text-cyan-400" />
                    {selected.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    District Cyber Operations & Intercept Center
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    selected.threat_level === "CRITICAL"
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : selected.threat_level === "HIGH"
                      ? "bg-orange-500/20 text-orange-400 border-orange-500/40"
                      : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  }`}
                >
                  {selected.threat_level} THREAT
                </div>
              </div>

              {/* Threat Gauge */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Tactical Threat Intensity</span>
                  <span className="font-mono font-bold text-cyan-300">{selected.score} / 100</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      selected.score >= 80 ? "bg-red-500" : selected.score >= 60 ? "bg-orange-400" : "bg-cyan-400"
                    }`}
                    style={{ width: `${selected.score}%` }}
                  />
                </div>
              </div>

              {/* Active Scam Vector */}
              <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <AlertTriangle size={14} /> Active Modus Operandi
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {selected.active_scam}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase">Daily Interceptions</span>
                  <p className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                    {selected.intercepted_today} cases
                  </p>
                </div>
                <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase">Intervention Unit</span>
                  <p className="text-xs font-semibold text-cyan-300 mt-0.5">
                    SP Cyber Police Squad
                  </p>
                </div>
              </div>

              {/* Emergency Action */}
              <div className="pt-2 flex gap-3">
                <a
                  href={`https://www.google.com/maps/search/cyber+police+station+${selected.name.split(" ")[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-300 text-center rounded-xl text-xs font-bold transition"
                >
                  Locate Cyber Police Station in {selected.name.split(" ")[0]} ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
