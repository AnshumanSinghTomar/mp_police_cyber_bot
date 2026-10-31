import { 
  FileText, Shield, MapPin, Radio, Mail, Radar, Link2, 
  CreditCard, PhoneCall, Scale, Database, AlertOctagon 
} from "lucide-react";
import type { Lang } from "../App";
import { cyberAudio } from "../utils/audioSynth";

interface Props {
  onFIR: () => void;
  onTips: () => void;
  onNearby: () => void;
  onEmailCheck: () => void;
  onThreatRadar: () => void;
  onURLScan: () => void;
  onUPIScan: () => void;
  onDigitalArrest: () => void;
  onLegalSections: () => void;
  onBreachCheck: () => void;
  onSOS: () => void;
  lang: Lang;
}

const LIVE_ALERTS = [
  "⚡ Fake E-Challan APK Warning — Bhopal",
  "⚡ Stock Trading Group Scam — Indore",
  "⚡ Digital Arrest Video Call Extortion — Jabalpur",
  "⚡ Fake Electricity Bill Disconnect SMS — Gwalior",
  "⚡ Mahakal VIP Pass Fake Portal — Ujjain",
  "⚡ Telegram Part-Time Review Fraud — Rewa",
];

export default function Sidebar({
  onFIR,
  onTips,
  onNearby,
  onEmailCheck,
  onThreatRadar,
  onURLScan,
  onUPIScan,
  onDigitalArrest,
  onLegalSections,
  onBreachCheck,
  onSOS,
}: Props) {
  const alertIndex = Math.floor(Date.now() / 6000) % LIVE_ALERTS.length;
  const alert = LIVE_ALERTS[alertIndex];

  return (
    <aside className="w-64 min-w-[16rem] h-full flex flex-col bg-slate-950/95 border-r border-cyan-500/20 py-3 overflow-y-auto scrollbar-thin select-none">
      {/* Live threat ticker */}
      <div className="mx-3 mb-3 p-2 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center gap-2 overflow-hidden shadow-inner">
        <Radio size={12} className="text-red-400 shrink-0 animate-ping" />
        <span className="text-[10px] text-red-200 font-mono font-semibold whitespace-nowrap animate-marquee">
          {alert}
        </span>
      </div>

      {/* Emergency Red SOS Button */}
      <div className="px-3 mb-3">
        <button
          onClick={() => {
            cyberAudio.playAlertKlaxon();
            onSOS();
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition transform active:scale-95"
        >
          <AlertOctagon size={16} className="animate-bounce" />
          <span>Emergency Scam SOS</span>
        </button>
      </div>

      {/* Primary Defense Arsenal */}
      <div className="px-3 mb-3 space-y-1">
        <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest px-1 font-bold">
          Tactical Arsenal
        </p>

        <SideBtn
          icon={<Radar size={15} />}
          label="Threat Radar Heatmap"
          sub="Live MP district telemetry"
          onClick={() => {
            cyberAudio.playRadarPing();
            onThreatRadar();
          }}
          accent
        />

        <SideBtn
          icon={<FileText size={15} />}
          label="File Official FIR"
          sub="Statutory PDF complaint"
          onClick={() => {
            cyberAudio.playBlip();
            onFIR();
          }}
          highlight
        />

        <SideBtn
          icon={<Link2 size={15} />}
          label="URL & Phishing Lab"
          sub="Homoglyph & spoof scanner"
          onClick={() => {
            cyberAudio.playScan();
            onURLScan();
          }}
        />

        <SideBtn
          icon={<CreditCard size={15} />}
          label="UPI & QR Fraud Verifier"
          sub="Collect trap & fake VPA check"
          onClick={() => {
            cyberAudio.playScan();
            onUPIScan();
          }}
        />

        <SideBtn
          icon={<PhoneCall size={15} />}
          label="Digital Arrest & OSINT"
          sub="Fake CBI/Police call buster"
          onClick={() => {
            cyberAudio.playScan();
            onDigitalArrest();
          }}
        />

        <SideBtn
          icon={<Scale size={15} />}
          label="IT Act & Legal Charges"
          sub="Statutory court provisions"
          onClick={() => {
            cyberAudio.playBlip();
            onLegalSections();
          }}
        />

        <SideBtn
          icon={<Database size={15} />}
          label="Dark Web Breach Audit"
          sub="Indian leak pool search"
          onClick={() => {
            cyberAudio.playScan();
            onBreachCheck();
          }}
        />

        <SideBtn
          icon={<Mail size={15} />}
          label="Email Phishing Scanner"
          sub="Inspect sender headers"
          onClick={() => {
            cyberAudio.playBlip();
            onEmailCheck();
          }}
        />
      </div>

      {/* Public Assistance */}
      <div className="px-3 mb-3 space-y-1">
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest px-1 font-bold">
          Citizen Assistance
        </p>
        <SideBtn
          icon={<Shield size={15} />}
          label="Cyber Safety Protocols"
          sub="Best defense practices"
          onClick={() => {
            cyberAudio.playBlip();
            onTips();
          }}
        />
        <SideBtn
          icon={<MapPin size={15} />}
          label="Nearest Police Station"
          sub="Direct GPS navigation"
          onClick={() => {
            cyberAudio.playBlip();
            onNearby();
          }}
        />
      </div>

      {/* Helplines Box */}
      <div className="px-3 mb-3 space-y-1.5">
        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest px-1 font-bold">
          Official Emergency Despatches
        </p>
        <HelpLine icon="📞" label="National Cyber Helpline" value="1930" href="tel:1930" />
        <HelpLine icon="🌐" label="National Portal" value="cybercrime.gov.in" href="https://cybercrime.gov.in" />
        <HelpLine icon="📱" label="CEIR Lost Device Block" value="sancharsathi.gov.in" href="https://sancharsathi.gov.in" />
      </div>

      {/* MP Police Cyber HQ Seal */}
      <div className="mt-auto px-3 pt-2 pb-1">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-cyan-500/20 text-center">
          <p className="text-[10px] font-mono text-cyan-400 font-bold">MP POLICE CYBER CELL</p>
          <p className="text-[9px] text-slate-500">Bhadbhada Road, Bhopal, MP</p>
          <p className="text-[8px] text-slate-600 mt-0.5">Automated Electronic Sentinel v3.8</p>
        </div>
      </div>
    </aside>
  );
}

function SideBtn({
  icon,
  label,
  sub,
  onClick,
  accent,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
  accent?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition ${
        accent
          ? "bg-cyan-500/15 border-cyan-400/40 hover:bg-cyan-500/25 text-cyan-300"
          : highlight
          ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300"
          : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/80 hover:border-cyan-500/30 text-slate-300"
      }`}
    >
      <span className={accent ? "text-cyan-400" : highlight ? "text-emerald-400" : "text-slate-400"}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold truncate leading-tight">{label}</p>
        <p className="text-[10px] text-slate-500 truncate leading-tight">{sub}</p>
      </div>
    </button>
  );
}

function HelpLine({
  icon,
  label,
  value,
  href,
}: {
  icon: string;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-800/80 flex items-center justify-between transition group"
    >
      <div className="flex items-center gap-2">
        <span className="text-sm">{icon}</span>
        <div className="text-left">
          <p className="text-[9px] text-slate-500 leading-none">{label}</p>
          <p className="text-xs text-cyan-300 font-mono font-medium group-hover:text-cyan-200">
            {value}
          </p>
        </div>
      </div>
      <span className="text-slate-650 group-hover:text-cyan-400 text-xs">↗</span>
    </a>
  );
}