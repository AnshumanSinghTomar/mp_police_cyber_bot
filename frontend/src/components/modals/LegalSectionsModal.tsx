import { useState } from "react";
import { Scale, X, Shield, Gavel, Search } from "lucide-react";
import { cyberAudio } from "../../utils/audioSynth";

interface Props {
  onClose: () => void;
}

const SECTIONS = [
  {
    act: "IT Act 2000",
    section: "Section 66C",
    title: "Identity Theft & Electronic Impersonation",
    punishment: "Imprisonment up to 3 years and fine up to Rs. 1 Lakh",
    desc: "Fraudulently making use of electronic signature, password, or any other unique identification feature of any other person (e.g. OTP theft, stolen credentials).",
    tag: "OTP / Identity",
  },
  {
    act: "IT Act 2000",
    section: "Section 66D",
    title: "Cheating by Personation using Computer Resource",
    punishment: "Imprisonment up to 3 years and fine up to Rs. 1 Lakh",
    desc: "Cheating by personating someone through any computer resource or communication device (e.g., fake CBI officer, fake bank manager, fake tech support).",
    tag: "Impersonation",
  },
  {
    act: "BNS 2023 / IPC 420",
    section: "Section 318(4) BNS",
    title: "Cheating & Dishonestly Inducing Delivery of Property",
    punishment: "Rigorous imprisonment up to 7 years + Mandatory Fine",
    desc: "Deceiving someone and fraudulently inducing them to deliver money or property (e.g., UPI fraud, investment scam, task fraud).",
    tag: "Financial Fraud",
  },
  {
    act: "BNS 2023 / IPC 506",
    section: "Section 351 BNS",
    title: "Criminal Intimidation & Extortion",
    punishment: "Imprisonment up to 2 to 7 years",
    desc: "Threatening someone with injury to reputation or property with intent to cause alarm (e.g., Digital Arrest intimidation, sextortion).",
    tag: "Extortion",
  },
  {
    act: "IT Act 2000",
    section: "Section 67 / 67A",
    title: "Publishing / Transmitting Obscene Content in Electronic Form",
    punishment: "First conviction: up to 5 yrs + Rs 10 Lakh fine; subsequent up to 7 yrs",
    desc: "Transmitting sexually explicit material electronically, non-consensual deepfakes, or blackmail video creation.",
    tag: "Sextortion",
  },
  {
    act: "IT Act 2000",
    section: "Section 43 & 66",
    title: "Computer Contaminant, Malware & Data Tampering",
    punishment: "Civil damages/compensation up to Rs 1 Crore + 3 yrs imprisonment",
    desc: "Unauthorized access, downloading or copying data without permission, introducing malware/ransomware or denying system access.",
    tag: "Hacking / Malware",
  },
];

export default function LegalSectionsModal({ onClose }: Props) {
  const [search, setSearch] = useState("");
  const [selectedAct, setSelectedAct] = useState<string>("ALL");

  const filtered = SECTIONS.filter((s) => {
    const matchesSearch =
      s.section.toLowerCase().includes(search.toLowerCase()) ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.desc.toLowerCase().includes(search.toLowerCase()) ||
      s.tag.toLowerCase().includes(search.toLowerCase());
    const matchesAct =
      selectedAct === "ALL" || (selectedAct === "ITACT" ? s.act.includes("IT") : s.act.includes("BNS"));
    return matchesSearch && matchesAct;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 border-b border-cyan-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Scale size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                CYBER LAW & STATUTORY CHARGES ENCYCLOPEDIA
              </h2>
              <p className="text-xs text-slate-400">
                Information Technology Act 2000 & Bharatiya Nyaya Sanhita (BNS) Provisions
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

        {/* Filter controls */}
        <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <Search size={14} className="text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by section, crime, or keyword (e.g. 66D, OTP, BNS)..."
              className="bg-transparent border-none outline-none text-white w-full placeholder-slate-600"
            />
          </div>

          <div className="flex gap-1.5">
            {[
              { id: "ALL", label: "All Statutes" },
              { id: "ITACT", label: "IT Act 2000" },
              { id: "BNS", label: "BNS / IPC" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedAct(tab.id);
                  cyberAudio.playBlip();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                  selectedAct === tab.id
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section List */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {item.section}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{item.act}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {item.tag}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white">{item.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-red-400 font-medium">
                  <strong>Punishment:</strong> {item.punishment}
                </span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Gavel size={13} /> Police Cognizable
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-center text-slate-500 text-xs py-8">
              No statutory sections match your query.
            </p>
          )}

          {/* Section 65B Electronic Certificate Info */}
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300 space-y-1.5">
            <h5 className="font-bold text-cyan-300 uppercase flex items-center gap-1.5">
              <Shield size={14} /> Section 65B Certificate Requirement (BSA Sec 63)
            </h5>
            <p className="leading-relaxed">
              To present printouts of WhatsApp messages, emails, or bank statements in Indian courts, you must provide
              a certificate under Section 65B of the Indian Evidence Act (now Section 63 Bharatiya Sakshya Adhiniyam)
              certifying that the output was generated by a computer/phone in lawful custody and working properly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
