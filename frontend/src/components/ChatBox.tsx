import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import type { Message } from "../types";
import type { Lang } from "../App";
import RiskMeter from "./RiskMeter";
import { 
  Mic, MicOff, Send, Volume2, VolumeX, RotateCcw, 
  FileText, Download, Loader2, Scale, Link2, ShieldAlert 
} from "lucide-react";
import { cyberAudio } from "../utils/audioSynth";

const API_BASE = import.meta.env.VITE_API_URL || "";

// ─── Typewriter ──────────────────────────────────────────────────────────────
function TypewriterText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);
  const words = text.split(" ");

  useEffect(() => {
    if (indexRef.current >= words.length) {
      onDone?.();
      return;
    }

    const tick = setInterval(() => {
      if (indexRef.current >= words.length) {
        clearInterval(tick);
        onDone?.();
        return;
      }
      setDisplayed((prev) => (prev ? prev + " " : "") + words[indexRef.current]);
      indexRef.current++;
    }, 28);

    return () => clearInterval(tick);
  }, []);

  return <ReactMarkdown>{displayed || "▋"}</ReactMarkdown>;
}

// ─── Tactical Preset Scenarios ───────────────────────────────────────────────
const SUGGESTIONS: Record<Lang, string[]> = {
  en: [
    "🚨 Received fake CBI / FedEx video call threat (Digital Arrest)",
    "💸 Transferred Rs. 45,000 to fake electricity bill link via UPI",
    "📱 Stolen OTP and unauthorized net banking withdrawal",
    "⚠️ Morphed video blackmail on WhatsApp (Sextortion)",
  ],
  hi: [
    "🚨 नकली CBI / पार्सल वीडियो कॉल पर गिरफ्तारी की धमकी (डिजिटल अरेस्ट)",
    "💸 बिजली बिल कटने के फर्जी लिंक पर 45,000 रुपये कट गए",
    "📱 फर्जी OTP कॉल से बैंक खाते से अनधिकृत निकासी",
    "⚠️ व्हाट्सएप पर वीडियो कॉल ब्लैकमेल (सेक्सटॉर्शन)",
  ],
};

const UI_TEXT: Record<Lang, { placeholder: string; title: string; subtitle: string; actions: string }> = {
  en: {
    placeholder: "Describe cybercrime incident or paste suspicious message…",
    title: "MP CYBER COP SENTINEL AI",
    subtitle: "Real-time threat triage, digital forensic guidance & electronic FIR formulation",
    actions: "Tactical Response Directives",
  },
  hi: {
    placeholder: "साइबर अपराध की घटना बताएं या संदिग्ध संदेश पेस्ट करें…",
    title: "MP साइबर कॉप AI प्रहरी",
    subtitle: "तत्काल साइबर खतरा जांच, डिजिटल साक्ष्य सुरक्षा व इलेक्ट्रॉनिक FIR",
    actions: "आवश्यक कार्रवाई निर्देश",
  },
};

interface ChatBoxProps {
  lang: Lang;
  isMatrixMode?: boolean;
  onOpenLegal?: (query?: string) => void;
  onOpenURL?: (url?: string) => void;
}

export default function ChatBox({ lang, isMatrixMode, onOpenLegal, onOpenURL }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [riskScore, setRiskScore] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const hasResultRef = useRef(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [typingIds, setTypingIds] = useState<Set<string>>(new Set());

  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Voice Input ─────────────────────────────────────────────────────────────
  const toggleVoice = () => {
    setVoiceError("");

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setInterimText("");
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setVoiceError("Voice input not supported in this browser. Use Chrome or Edge.");
      return;
    }

    const rec = new SR();
    rec.lang = lang === "hi" ? "hi-IN" : "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    hasResultRef.current = false;

    rec.onresult = (e: any) => {
      let interim = "";
      let final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      if (final) {
        hasResultRef.current = true;
        setInput((prev) => (prev ? prev + " " : "") + final.trim());
        setInterimText("");
      } else {
        setInterimText(interim);
      }
    };

    rec.onerror = (e: any) => {
      setVoiceError(`Voice error: ${e.error}`);
      setIsListening(false);
      setInterimText("");
    };

    rec.onend = () => {
      setIsListening(false);
      setInterimText("");
      if (hasResultRef.current) inputRef.current?.focus();
    };

    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
    cyberAudio.playBlip();
  };

  // ── Text-to-Speech ──────────────────────────────────────────────────────────
  const toggleSpeak = (text: string, id: string) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[#*`_>~\[\]]/g, "");
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = lang === "hi" ? "hi-IN" : "en-IN";
    utt.rate = lang === "hi" ? 0.9 : 0.95;
    utt.pitch = 1;
    utt.onend = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utt);
  };

  // ── Heuristic Risk Calculation ──────────────────────────────────────────────
  const calcRisk = (text: string) => {
    const l = text.toLowerCase();
    let s = 15;
    if (l.includes("digital arrest") || l.includes("cbi") || l.includes("parcel")) s = 95;
    else if (l.includes("hack") || l.includes("morphed")) s = 90;
    else if (l.includes("otp")) s = 85;
    else if (l.includes("scam") || l.includes("fraud")) s = 80;
    else if (l.includes("bank") || l.includes("deducted")) s = 75;
    else if (l.includes("upi")) s = 65;
    setRiskScore(s);
  };

  // ── Send Message ────────────────────────────────────────────────────────────
  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    calcRisk(msg);
    cyberAudio.playScan();

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history, lang }),
      });
      const data = await res.json();
      const botId = (Date.now() + 1).toString();

      if (typeof data.risk === "number") {
        setRiskScore(data.risk);
        if (data.risk >= 70) {
          cyberAudio.playAlertKlaxon();
        } else {
          cyberAudio.playSuccess();
        }
      }

      const isCrime = typeof data.risk === "number" && data.risk >= 45;
      const botMsg: Message = {
        id: botId,
        role: "assistant",
        content: data.reply || "No response received.",
        threat: data.threat,
        level: data.level,
        canAutoFIR: isCrime,
        userMsg: msg,
        actions: data.actions ?? [],
      };

      setMessages((prev) => [...prev, botMsg]);
      setTypingIds((prev) => new Set(prev).add(botId));
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          content: "⚠️ MP Cyber Command backend unavailable. Ensure Flask is active on port 5000 or call 1930 directly.",
        },
      ]);
    }

    setLoading(false);
  };

  const clearChat = () => {
    window.speechSynthesis.cancel();
    cyberAudio.playBlip();
    setMessages([]);
    setRiskScore(0);
    setSpeakingId(null);
  };

  // ── Auto FIR from chat ──────────────────────────────────────────────────────
  const autoGenerateFIR = async (msgId: string, userMsg: string) => {
    cyberAudio.playScan();
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, firFile: "loading" } : m)));
    try {
      const res = await fetch(`${API_BASE}/api/auto-fir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      if (data.file) {
        cyberAudio.playSuccess();
        setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, firFile: data.file } : m)));
      } else {
        setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, firFile: "error" } : m)));
      }
    } catch {
      setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, firFile: "error" } : m)));
    }
  };

  return (
    <div
      className={`flex flex-col h-full rounded-2xl border transition-all duration-300 overflow-hidden ${
        isMatrixMode
          ? "bg-black border-green-500/50 text-green-400 font-mono shadow-[0_0_25px_rgba(34,197,94,0.2)]"
          : "bg-slate-950/80 border-cyan-500/20 text-slate-100 shadow-2xl backdrop-blur-xl"
      }`}
    >
      {/* ── Top Header ── */}
      <div className="px-5 py-3 border-b border-cyan-500/20 flex items-center justify-between shrink-0 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">
            SENTINEL ACTIVE CONSOLE
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 border border-cyan-500/30 text-cyan-300">
            LLAMA-3.3 70B FORENSIC
          </span>
        </div>

        <button
          onClick={clearChat}
          title="Reset conversation"
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* ── Dynamic Risk Meter ── */}
      <div className="px-5 pt-3 pb-1 shrink-0">
        <RiskMeter score={riskScore} />
      </div>

      {/* ── Messages Feed ── */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/15">
              🚔
            </div>
            <div>
              <p className="text-cyan-400 font-extrabold text-lg tracking-wide uppercase mb-1">
                {UI_TEXT[lang].title}
              </p>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                {UI_TEXT[lang].subtitle}
              </p>
            </div>

            {/* Tactical Scenario Presets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-xl pt-2">
              {SUGGESTIONS[lang].map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="p-3 rounded-xl bg-slate-900/70 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/40 text-left text-xs text-slate-300 hover:text-cyan-200 transition shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-sm mr-2.5 mt-1 shrink-0 shadow-md shadow-cyan-500/20">
                🤖
              </div>
            )}

            <div className="relative max-w-[82%] group space-y-2">
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-lg shadow-cyan-950/40"
                    : isMatrixMode
                    ? "bg-black border border-green-500/40 text-green-300 rounded-tl-none font-mono"
                    : "bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none shadow-xl"
                }`}
              >
                {msg.role === "assistant" && typingIds.has(msg.id) ? (
                  <TypewriterText
                    text={msg.content}
                    onDone={() =>
                      setTypingIds((prev) => {
                        const n = new Set(prev);
                        n.delete(msg.id);
                        return n;
                      })
                    }
                  />
                ) : (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                )}
              </div>

              {/* Threat classification badge */}
              {msg.role === "assistant" && msg.threat && msg.threat !== "GENERAL CYBER THREAT" && (
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    msg.level === "HIGH"
                      ? "bg-red-500/20 border-red-500/40 text-red-300"
                      : msg.level === "MEDIUM"
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                      : "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  }`}
                >
                  <ShieldAlert size={12} />
                  <span>CLASSIFICATION: {msg.threat}</span>
                </div>
              )}

              {/* Tactical Directives / Action recommendations */}
              {msg.role === "assistant" && msg.actions && msg.actions.length > 0 && (
                <div className="rounded-xl border border-cyan-500/30 bg-slate-950/70 p-3 space-y-1.5">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                    {UI_TEXT[lang].actions}
                  </p>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {msg.actions.map((act, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold shrink-0">›</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons (Auto FIR, Legal Provisions Matcher, URL Inspector) */}
              {msg.role === "assistant" && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {msg.canAutoFIR && (
                    <>
                      {!msg.firFile && (
                        <button
                          onClick={() => autoGenerateFIR(msg.id, msg.userMsg!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold transition"
                        >
                          <FileText size={12} /> Auto-Generate FIR Document
                        </button>
                      )}
                      {msg.firFile === "loading" && (
                        <span className="flex items-center gap-1.5 text-xs text-cyan-300">
                          <Loader2 size={12} className="animate-spin" /> Drafting State Electronic FIR…
                        </span>
                      )}
                      {msg.firFile && msg.firFile !== "loading" && msg.firFile !== "error" && (
                        <button
                          onClick={() => window.open(`${API_BASE}/download-fir/${msg.firFile}`, "_blank")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition shadow-lg shadow-emerald-500/20"
                        >
                          <Download size={13} /> Download Official FIR (PDF)
                        </button>
                      )}
                    </>
                  )}

                  {/* Match Legal Charges Button */}
                  <button
                    onClick={() => onOpenLegal?.(msg.threat || msg.content)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] transition"
                  >
                    <Scale size={11} className="text-cyan-400" />
                    <span>View IT Act & BNS Charges</span>
                  </button>

                  {/* Deep URL Scan button if link mentioned */}
                  {msg.content.includes("http") && (
                    <button
                      onClick={() => onOpenURL?.()}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] transition"
                    >
                      <Link2 size={11} className="text-cyan-400" />
                      <span>Inspect Link</span>
                    </button>
                  )}

                  {/* Listen audio TTS */}
                  <button
                    onClick={() => toggleSpeak(msg.content, msg.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] transition"
                  >
                    {speakingId === msg.id ? <VolumeX size={11} className="text-red-400" /> : <Volume2 size={11} />}
                    <span>{speakingId === msg.id ? "Stop" : "Audio Dispatch"}</span>
                  </button>
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-sm ml-2.5 mt-1 shrink-0">
                👤
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-sm shrink-0">
              🤖
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input Console ── */}
      <div className="p-4 border-t border-cyan-500/20 shrink-0 bg-slate-900/30">
        {voiceError && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-1.5 mb-2 flex items-center gap-2">
            <MicOff size={13} /> {voiceError}
          </p>
        )}

        {interimText && (
          <p className="text-xs text-cyan-300 italic px-2 mb-1.5 flex items-center gap-1.5 animate-pulse">
            <span>🎙️</span> {interimText}
          </p>
        )}

        <div className="flex items-center gap-2 bg-slate-900/90 border border-cyan-500/30 focus-within:border-cyan-400 rounded-2xl px-3 py-1.5 transition shadow-inner">
          <button
            onClick={toggleVoice}
            title={isListening ? "Stop listening" : "Voice input"}
            className={`p-2 rounded-xl transition ${
              isListening
                ? "bg-red-500/20 text-red-400 animate-pulse"
                : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setVoiceError("");
              calcRisk(e.target.value);
            }}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={
              isListening
                ? lang === "hi"
                  ? "🎙️ सुन रहा है... बोलिए..."
                  : "🎙️ Listening... Speak now..."
                : UI_TEXT[lang].placeholder
            }
            className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-white placeholder-slate-500"
          />

          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition shadow-lg shadow-cyan-500/25 flex items-center justify-center"
          >
            <Send size={15} />
          </button>
        </div>

        <p className="text-center text-[10px] text-slate-500 mt-2">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Enter</kbd> to dispatch · All complaints protected under Indian IT Act 2000
        </p>
      </div>
    </div>
  );
}
