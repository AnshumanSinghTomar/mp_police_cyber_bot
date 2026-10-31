import { useState, useEffect } from "react";
import { Volume2, VolumeX, Terminal, AlertOctagon, PhoneCall, LogOut, Radio } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cyberAudio } from "../utils/audioSynth";
import type { Lang } from "../App";

interface HeaderProps {
  onSOS: () => void;
  lang: Lang;
  onLangToggle: () => void;
  isMatrixMode: boolean;
  onToggleMatrix: () => void;
}

export default function Header({
  onSOS,
  lang,
  onLangToggle,
  isMatrixMode,
  onToggleMatrix,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [tickerCount, setTickerCount] = useState(729);

  useEffect(() => {
    const t = setInterval(() => {
      setTickerCount((c) => c + (Math.random() > 0.6 ? 1 : 0));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const toggleSound = () => {
    cyberAudio.isMuted = !isMuted;
    setIsMuted(!isMuted);
    if (isMuted) {
      cyberAudio.playBlip();
    }
  };

  return (
    <header className="h-14 border-b border-cyan-500/20 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">🚔</span>
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border border-black animate-ping" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-sm tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
              <span>MP CYBER POLICE</span>
              <span className="text-[10px] text-cyan-200/80 font-normal border border-cyan-500/30 px-1.5 py-0.2 rounded bg-cyan-950/40">
                STATE COMMAND AI
              </span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Madhya Pradesh Cyber Threat Defense Network</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-cyan-400 font-mono hidden sm:inline">{tickerCount} Intercepts Active</span>
          </p>
        </div>
      </div>

      {/* Center Tactical Status (Hidden on very small screens) */}
      <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-xl text-xs">
        <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold">
          <Radio size={12} className="animate-pulse" />
          <span>DEFCON 2</span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="text-[11px] text-slate-300">
          State Cyber HQ Bhopal <span className="text-emerald-400">● ONLINE</span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Emergency SOS Red Button */}
        <button
          onClick={() => {
            cyberAudio.playAlertKlaxon();
            onSOS();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-600/40 animate-pulse transition"
        >
          <AlertOctagon size={14} />
          <span>RED ALERT SOS</span>
        </button>

        {/* 1930 Quick Dial */}
        <a
          href="tel:1930"
          title="Dial National Cyber Helpline 1930"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 font-mono font-bold text-xs transition"
        >
          <PhoneCall size={12} className="text-cyan-400" />
          <span>1930</span>
        </a>

        {/* Matrix Mode Toggle */}
        <button
          onClick={() => {
            cyberAudio.playScan();
            onToggleMatrix();
          }}
          title={isMatrixMode ? "Exit Matrix HUD" : "Enter Matrix Green HUD Mode"}
          className={`p-2 rounded-xl border transition ${
            isMatrixMode
              ? "bg-green-500/20 border-green-500 text-green-400 shadow-lg shadow-green-500/30"
              : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Terminal size={15} />
        </button>

        {/* SFX Mute Toggle */}
        <button
          onClick={toggleSound}
          title={isMuted ? "Unmute Cyber SFX Synth" : "Mute Cyber SFX Synth"}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-400 transition"
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} className="text-cyan-400" />}
        </button>

        {/* Language switch */}
        <button
          onClick={() => {
            cyberAudio.playBlip();
            onLangToggle();
          }}
          className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-xs font-bold text-cyan-300 transition"
        >
          {lang === "en" ? "🇮🇳 हिंदी" : "🇬🇧 EN"}
        </button>

        {/* User / Officer Profile & Sign out */}
        {user && (
          <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-[11px] font-bold text-slate-200 truncate max-w-[110px]">
                {user.displayName || user.email?.split("@")[0] || "Officer"}
              </span>
              <span className="text-[9px] text-cyan-400 font-mono">
                {user.isGuest ? "TACTICAL GUEST" : "ACTIVE SESSION"}
              </span>
            </div>
            <button
              onClick={() => {
                cyberAudio.playBlip();
                logout();
              }}
              title="Sign out of command console"
              className="p-2 rounded-xl bg-slate-900 hover:bg-red-500/20 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
