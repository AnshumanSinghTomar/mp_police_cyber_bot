import { Shield, Smartphone, Globe, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { cyberAudio } from "../../utils/audioSynth";

interface Props {
  onClose: () => void;
}

export default function SafetyTips({ onClose }: Props) {
  const tips = [
    { title: "Never Share OTPs or PINs", desc: "No bank, police officer, or government department will ever ask for your OTP or UPI MPIN." },
    { title: "Beware of Suspicious APKs", desc: "Never install APK files sent via WhatsApp/SMS claiming to be 'Electricity Bill Updates' or 'Traffic E-Challans'." },
    { title: "Enforce Hardware/App 2FA", desc: "Activate authenticator apps (Google Authenticator) instead of SMS OTP for high-value banking and email." },
    { title: "Hang Up on 'Digital Arrest' Calls", desc: "Courts and police NEVER conduct video call trials or demand monetary settlements on Skype." },
    { title: "Verify Payment QR Codes", desc: "QR codes are only for paying money, NEVER for receiving money or winning lotteries." },
  ];

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-950 border border-cyan-500/40 shadow-2xl shadow-cyan-950/60 p-6 rounded-2xl w-full max-w-lg space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/30">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                CYBER SAFETY PROTOCOLS
              </h2>
              <p className="text-[11px] text-slate-400">Madhya Pradesh Police Cyber Command Best Practices</p>
            </div>
          </div>
          <button
            onClick={() => {
              cyberAudio.playBlip();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Warning callout */}
        <div className="bg-red-950/40 border border-red-500/40 text-red-200 p-3 rounded-xl text-xs flex items-center gap-2.5">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <span>
            If financial loss has occurred, dial <strong className="text-white underline">1930</strong> immediately to trigger golden-hour fund freeze.
          </span>
        </div>

        {/* Safety tips list */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto scrollbar-thin pr-1">
          {tips.map((t, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800/90 p-3 rounded-xl flex items-start gap-2.5 text-xs hover:border-cyan-500/30 transition"
            >
              <CheckCircle2 size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-200">{t.title}</p>
                <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Official resource buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-semibold transition"
          >
            <Globe size={13} /> cybercrime.gov.in
          </a>
          <a
            href="https://sancharsathi.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 p-2.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-semibold transition"
          >
            <Smartphone size={13} /> Sanchar Saathi
          </a>
        </div>
      </div>
    </div>
  );
}
