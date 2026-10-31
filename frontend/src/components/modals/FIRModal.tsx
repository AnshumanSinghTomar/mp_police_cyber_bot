import { useState } from "react"
import { FileText, X, Download, Loader2 } from "lucide-react"

interface Props {
  onClose: () => void
}

// ─── Dropdown options ──────────────────────────────────────────────────────
const CRIME_TYPES = [
  "Banking / ATM Fraud",
  "UPI / Payment Scam",
  "OTP Theft",
  "Phishing / Fake Website",
  "Social Media Hacking",
  "Online Job Fraud",
  "Lottery / Prize Scam",
  "Investment / Trading Scam",
  "Sextortion / Blackmail",
  "Identity Theft",
  "Fake Customer Care Call",
  "Ransomware / Malware Attack",
  "Cryptocurrency Fraud",
  "E-Commerce Fraud",
  "Other Cybercrime",
]

const PLATFORMS = [
  "WhatsApp",
  "Telegram",
  "Instagram",
  "Facebook",
  "Email",
  "Phone Call / SMS",
  "Google Pay / PhonePe / Paytm",
  "Fake Website / Link",
  "Online Shopping Site",
  "YouTube / Video Call",
  "Unknown",
  "Other",
]

const GENDERS = ["Male", "Female", "Other", "Prefer not to say"]

const MP_DISTRICTS = [
  "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar",
  "Rewa", "Satna", "Dewas", "Chhindwara", "Ratlam", "Vidisha",
  "Shivpuri", "Mandsaur", "Neemuch", "Hoshangabad", "Betul",
  "Seoni", "Balaghat", "Dhar", "Khandwa", "Khargone", "Burhanpur",
  "Katni", "Narsinghpur", "Raisen", "Morena", "Bhind", "Datia",
  "Tikamgarh", "Chhatarpur", "Panna", "Damoh", "Shajapur", "Agar Malwa",
  "Rajgarh", "Shahdol", "Anuppur", "Umaria", "Dindori", "Mandla",
  "Alirajpur", "Jhabua", "Barwani", "Singrauli", "Sidhi", "Other",
]

// ─── Field component ───────────────────────────────────────────────────────
function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 outline-none focus:border-cyan-500 text-sm text-slate-100 placeholder-slate-600 transition"
const selectCls = inputCls + " cursor-pointer"

// ─── Main Modal ────────────────────────────────────────────────────────────
export default function FIRModal({ onClose }: Props) {

  const [form, setForm] = useState({
    name: "", phone: "", email: "", gender: "", age: "",
    address: "", district: "", state: "Madhya Pradesh",
    crime_type: "", platform: "", incident_date: "",
    amount_lost: "", suspect_phone: "", suspect_email: "",
    incident_description: "", evidence: "",
  })

  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [dlFile,  setDlFile]    = useState("")
  const [error,   setError]     = useState("")

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const required = ["name", "phone", "district", "crime_type", "platform", "incident_date", "incident_description"]
  const isValid  = required.every(k => (form as any)[k].trim())

  const submit = async () => {
    if (!isValid || loading) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/generate-fir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Server error")
      const data = await res.json()
      setDlFile(data.file)
      setSuccess(true)
    } catch (e) {
      setError("FIR generation failed. Make sure the Flask server is running.")
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    window.open(`/download-fir/${dlFile}`, "_blank")
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4">
        <div className="bg-slate-900 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] p-8 rounded-2xl w-full max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl text-cyan-400 font-bold mb-2">FIR Generated!</h2>
          <p className="text-slate-400 text-sm mb-6">
            Your FIR has been created. Click below to download the PDF.
          </p>
          <button
            onClick={download}
            className="flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition mb-4"
          >
            <Download size={16} /> Download FIR PDF
          </button>
          <button onClick={onClose} className="text-slate-500 text-sm hover:text-slate-300 transition">
            Close
          </button>
        </div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-cyan-500/30 shadow-[0_0_30px_rgba(0,255,255,0.2)] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <FileText size={16} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base text-cyan-400 font-bold leading-tight">File FIR — MP Cyber Police</h2>
              <p className="text-[10px] text-slate-500">Fields marked <span className="text-red-400">*</span> are required</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition">
            <X size={18} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto px-6 py-4 space-y-5 flex-1">

          {/* Section: Personal Info */}
          <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold border-b border-slate-800 pb-1">
            Personal Information
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Full Name" required>
              <input value={form.name} onChange={set("name")} className={inputCls} placeholder="e.g. Ramesh Kumar" />
            </Field>
            <Field label="Phone Number" required>
              <input value={form.phone} onChange={set("phone")} className={inputCls} placeholder="10-digit mobile number" maxLength={10} />
            </Field>
            <Field label="Email Address">
              <input value={form.email} onChange={set("email")} className={inputCls} placeholder="your@email.com" type="email" />
            </Field>
            <Field label="Gender">
              <select value={form.gender} onChange={set("gender")} className={selectCls}>
                <option value="">Select gender</option>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <Field label="Age">
              <input value={form.age} onChange={set("age")} className={inputCls} placeholder="Your age" type="number" min={1} max={120} />
            </Field>
            <Field label="District" required>
              <select value={form.district} onChange={set("district")} className={selectCls}>
                <option value="">Select district</option>
                {MP_DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Full Address">
            <input value={form.address} onChange={set("address")} className={inputCls} placeholder="House No, Street, Area, City" />
          </Field>

          {/* Section: Crime Details */}
          <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold border-b border-slate-800 pb-1 mt-2">
            Crime Details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Crime Type" required>
              <select value={form.crime_type} onChange={set("crime_type")} className={selectCls}>
                <option value="">Select crime type</option>
                {CRIME_TYPES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Platform / Medium Used" required>
              <select value={form.platform} onChange={set("platform")} className={selectCls}>
                <option value="">Select platform</option>
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Date of Incident" required>
              <input value={form.incident_date} onChange={set("incident_date")} className={inputCls} type="date" />
            </Field>
            <Field label="Amount Lost (₹)">
              <input value={form.amount_lost} onChange={set("amount_lost")} className={inputCls} placeholder="Leave blank if none" type="number" min={0} />
            </Field>
          </div>

          {/* Section: Suspect Info */}
          <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold border-b border-slate-800 pb-1 mt-2">
            Suspect Information <span className="text-slate-600 normal-case font-normal">(if known)</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Suspect Phone">
              <input value={form.suspect_phone} onChange={set("suspect_phone")} className={inputCls} placeholder="Suspect's phone number" />
            </Field>
            <Field label="Suspect Email / ID">
              <input value={form.suspect_email} onChange={set("suspect_email")} className={inputCls} placeholder="Suspect's email / username" />
            </Field>
          </div>

          {/* Section: Description */}
          <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold border-b border-slate-800 pb-1 mt-2">
            Incident Description
          </p>
          <Field label="Describe what happened" required>
            <textarea
              value={form.incident_description}
              onChange={set("incident_description")}
              className={inputCls}
              placeholder="Explain what happened step by step — when, how, what you lost, etc."
              rows={4}
            />
          </Field>
          <Field label="Evidence / Screenshots / URLs">
            <textarea
              value={form.evidence}
              onChange={set("evidence")}
              className={inputCls}
              placeholder="List any screenshots, URLs, transaction IDs, or other evidence"
              rows={2}
            />
          </Field>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              ❌ {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-slate-800 shrink-0">
          <p className="text-[10px] text-slate-600">
            Data is processed locally and saved for police records.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm transition">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={loading || !isValid}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Generating…</>
                : <><FileText size={14} /> Generate & Download FIR</>
              }
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
