import { useState } from "react"
import { X, Mail, Loader2, ShieldAlert, ShieldCheck, Link, User } from "lucide-react"
import type { Lang } from "../../App"

interface Props {
  onClose: () => void
  lang:    Lang
}

interface Result {
  risk:          number
  level:         "LOW" | "MEDIUM" | "HIGH"
  senders:       string[]
  sender_issues: string[]
  flagged_links: { url: string; reasons: string[] }[]
  ai_verdict:    string
}

const TEXT: Record<Lang, Record<string, string>> = {
  en: {
    title:        "Email Phishing Detector",
    subtitle:     "Paste the suspicious email content below",
    placeholder:  "Paste full email here — including From, Subject, body and any links…",
    analyze:      "Analyze Email",
    analyzing:    "Analyzing…",
    sender:       "Sender Analysis",
    links:        "Suspicious Links",
    verdict:      "AI Verdict",
    noIssues:     "No sender issues detected",
    noLinks:      "No suspicious links found",
    reset:        "Check another email",
    riskLabel:    "Phishing Risk",
    safe:         "Looks Safe",
    warning:      "Suspicious",
    danger:       "High Risk — Likely Phishing",
  },
  hi: {
    title:        "ईमेल फ़िशिंग डिटेक्टर",
    subtitle:     "नीचे संदिग्ध ईमेल की सामग्री पेस्ट करें",
    placeholder:  "पूरा ईमेल यहाँ पेस्ट करें — From, Subject, बॉडी और सभी लिंक सहित…",
    analyze:      "ईमेल जांचें",
    analyzing:    "जांच हो रही है…",
    sender:       "प्रेषक विश्लेषण",
    links:        "संदिग्ध लिंक",
    verdict:      "AI निर्णय",
    noIssues:     "कोई प्रेषक समस्या नहीं मिली",
    noLinks:      "कोई संदिग्ध लिंक नहीं मिला",
    reset:        "दूसरा ईमेल जांचें",
    riskLabel:    "फ़िशिंग जोखिम",
    safe:         "सुरक्षित लगता है",
    warning:      "संदिग्ध",
    danger:       "उच्च जोखिम — संभावित फ़िशिंग",
  },
}

export default function EmailPhishingModal({ onClose, lang }: Props) {
  const t = TEXT[lang]

  const [emailText, setEmailText] = useState("")
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState<Result | null>(null)
  const [error,     setError]     = useState("")

  const analyze = async () => {
    if (!emailText.trim() || loading) return
    setLoading(true)
    setError("")
    setResult(null)
    try {
      const res  = await fetch("/api/check-email", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: emailText, lang }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) {
      setError(e.message || "Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  const riskColor = (level: string) =>
    level === "HIGH"   ? "text-red-400 border-red-500/40 bg-red-500/10"   :
    level === "MEDIUM" ? "text-yellow-400 border-yellow-500/40 bg-yellow-500/10" :
                         "text-green-400 border-green-500/40 bg-green-500/10"

  const riskIcon = (level: string) =>
    level === "HIGH" || level === "MEDIUM"
      ? <ShieldAlert size={20} />
      : <ShieldCheck size={20} />

  const verdictText = (level: string) =>
    level === "HIGH" ? t.danger : level === "MEDIUM" ? t.warning : t.safe

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Mail size={16} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base text-cyan-400 font-bold leading-tight">{t.title}</h2>
              <p className="text-[10px] text-slate-500">{t.subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4 flex-1 space-y-4">

          {!result ? (
            <>
              <textarea
                value={emailText}
                onChange={e => setEmailText(e.target.value)}
                rows={10}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800 border border-slate-700 outline-none focus:border-cyan-500 text-sm text-slate-100 placeholder-slate-600 transition resize-none font-mono"
                placeholder={t.placeholder}
              />
              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                  ❌ {error}
                </p>
              )}
            </>
          ) : (
            <>
              {/* Risk banner */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border font-bold ${riskColor(result.level)}`}>
                {riskIcon(result.level)}
                <div>
                  <p className="text-sm">{verdictText(result.level)}</p>
                  <p className="text-[10px] font-normal opacity-70">{t.riskLabel}: {result.risk}/100</p>
                </div>
              </div>

              {/* Sender */}
              <Section icon={<User size={13} />} title={t.sender}>
                {result.sender_issues.length === 0 ? (
                  <p className="text-xs text-green-400">✅ {t.noIssues}</p>
                ) : (
                  <ul className="space-y-1">
                    {result.sender_issues.map((iss, i) => (
                      <li key={i} className="text-xs text-red-300 flex gap-2">
                        <span className="text-red-500 shrink-0">⚠</span>{iss}
                      </li>
                    ))}
                  </ul>
                )}
                {result.senders.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {result.senders.map((s, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </Section>

              {/* Links */}
              <Section icon={<Link size={13} />} title={t.links}>
                {result.flagged_links.length === 0 ? (
                  <p className="text-xs text-green-400">✅ {t.noLinks}</p>
                ) : (
                  <ul className="space-y-2">
                    {result.flagged_links.map((fl, i) => (
                      <li key={i} className="rounded-lg bg-slate-800 border border-red-500/20 px-3 py-2 space-y-1">
                        <p className="text-[11px] font-mono text-red-300 break-all">{fl.url}</p>
                        {fl.reasons.map((r, j) => (
                          <p key={j} className="text-[10px] text-slate-400 flex gap-1.5">
                            <span className="text-orange-400">•</span>{r}
                          </p>
                        ))}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {/* AI Verdict */}
              <Section icon={<ShieldAlert size={13} />} title={t.verdict}>
                <p className="text-xs text-slate-300 leading-relaxed">{result.ai_verdict}</p>
              </Section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-800 shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm transition">
            {lang === "en" ? "Close" : "बंद करें"}
          </button>
          {result ? (
            <button
              onClick={() => { setResult(null); setEmailText("") }}
              className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition"
            >
              {t.reset}
            </button>
          ) : (
            <button
              onClick={analyze}
              disabled={loading || !emailText.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" />{t.analyzing}</> : <><Mail size={14} />{t.analyze}</>}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-800 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border-b border-slate-700">
        <span className="text-cyan-400">{icon}</span>
        <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">{title}</p>
      </div>
      <div className="px-3 py-2.5">{children}</div>
    </div>
  )
}
