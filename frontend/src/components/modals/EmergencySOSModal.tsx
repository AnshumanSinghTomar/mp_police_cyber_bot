import { useState, useEffect } from "react";
import { AlertOctagon, PhoneCall, ShieldAlert, Lock, X, ExternalLink, Zap } from "lucide-react";
import { cyberAudio } from "../../utils/audioSynth";

interface Props {
  onClose: () => void;
}

const EMERGENCY_BANKS = [
  { name: "State Bank of India (SBI)", tollfree: "18001234", sms: "BLOCK to 567676", portal: "https://www.onlinesbi.sbi" },
  { name: "HDFC Bank", tollfree: "18001600", sms: "CCBLOCK to 5676712", portal: "https://www.hdfcbank.com" },
  { name: "ICICI Bank", tollfree: "18001080", sms: "IBLOCK to 9215667777", portal: "https://www.icicibank.com" },
  { name: "Punjab National Bank (PNB)", tollfree: "18001802222", sms: "HOTLIST to 5607040", portal: "https://www.pnbindia.in" },
  { name: "Bank of Baroda (BOB)", tollfree: "18002584455", sms: "BLOCK to 8422009988", portal: "https://www.bankofbaroda.in" },
];

export default function EmergencySOSModal({ onClose }: Props) {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    cyberAudio.playAlertKlaxon();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-950 border-2 border-red-500/80 rounded-2xl shadow-2xl shadow-red-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Red Flashing Banner */}
        <div className="bg-gradient-to-r from-red-650 via-red-600 to-rose-700 px-6 py-4 flex items-center justify-between text-white animate-pulse">
          <div className="flex items-center gap-3">
            <AlertOctagon size={28} className="animate-bounce" />
            <div>
              <h2 className="text-lg font-black tracking-wider uppercase">
                EMERGENCY SCAM INTERCEPT (SOS PROTOCOL)
              </h2>
              <p className="text-xs text-red-100 font-medium">
                Golden Hour Financial Freeze & Victim Defense - MP Cyber Command
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tactical Steps Bar */}
        <div className="grid grid-cols-4 border-b border-red-500/30 bg-slate-900/60 text-xs font-semibold">
          {[
            { num: 1, label: "Dial 1930" },
            { num: 2, label: "Freeze Account" },
            { num: 3, label: "Revoke UPI" },
            { num: 4, label: "Evidence Lock" },
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => {
                setActiveStep(s.num);
                cyberAudio.playBlip();
              }}
              className={`py-3 px-2 text-center transition flex flex-col items-center gap-1 ${
                activeStep === s.num
                  ? "bg-red-500/20 text-red-400 border-b-2 border-red-500"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 border border-current flex items-center justify-center text-[10px]">
                {s.num}
              </span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-200 text-sm">
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-4">
                <div className="p-3 bg-red-500/20 text-red-400 rounded-xl">
                  <PhoneCall size={28} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-red-300">National Cybercrime Helpline: 1930</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    If money was fraudulently debited from your account within the last 2 hours (the "Golden Hour"),
                    call 1930 immediately. MP Police and the Indian Cybercrime Coordination Centre (I4C) will freeze
                    the transit mule account before the fraudster withdraws the cash at an ATM!
                  </p>
                  <div className="mt-3 flex gap-3">
                    <a
                      href="tel:1930"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/40 transition"
                    >
                      <Zap size={15} /> Direct Call 1930 Now
                    </a>
                    <a
                      href="https://cybercrime.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                    >
                      cybercrime.gov.in <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                  What to tell the 1930 Operator:
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  <li>Your Name & Mobile Number linked to bank</li>
                  <li>Bank Name & Account Number from which money was deducted</li>
                  <li>Approximate Time of Transaction & Total Amount Lost</li>
                  <li>Transaction ID / UTR Number (found in bank SMS)</li>
                  <li>Beneficiary account or UPI handle that received your money</li>
                </ul>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Contact your bank instantly to freeze your account and stop unauthorized net banking or debit card debits:
              </p>
              <div className="space-y-2.5">
                {EMERGENCY_BANKS.map((b) => (
                  <div
                    key={b.name}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between hover:border-red-500/40 transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{b.name}</p>
                      <p className="text-[11px] text-slate-400">
                        Emergency Toll-Free: <span className="text-cyan-400 font-mono font-bold">{b.tollfree}</span> | SMS: <span className="text-amber-300 font-mono">{b.sms}</span>
                      </p>
                    </div>
                    <a
                      href={`tel:${b.tollfree}`}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <PhoneCall size={12} /> Call Bank
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
                <Lock size={22} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase">Revoke Suspicious UPI Autopay & Mandates</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Scammers often establish recurring AutoPay mandates or link rogue UPI apps. Follow these steps:
                  </p>
                </div>
              </div>
              <ol className="space-y-2 text-xs text-slate-300">
                <li className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <strong className="text-cyan-300">1. Open PhonePe / GPay / Paytm:</strong> Navigate to Profile → Autopay / Mandates → Click on any unknown pending mandate and select <em>"Revoke / Cancel Mandate"</em>.
                </li>
                <li className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <strong className="text-cyan-300">2. Reset UPI MPIN:</strong> Change the UPI PIN immediately inside your payment app. Never reveal this PIN to anyone claiming to be a customer executive.
                </li>
                <li className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <strong className="text-cyan-300">3. De-link Bank Account:</strong> Remove the compromised bank account temporarily from all UPI third-party applications.
                </li>
              </ol>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
                <ShieldAlert size={22} className="text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-cyan-300 uppercase">Preserve Electronic Evidence (Section 65B)</h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Do not delete chats or call logs! Police and courts require unedited digital proof:
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="p-2.5 bg-slate-900 rounded-lg flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Full screenshot of WhatsApp / Telegram conversation showing caller phone number.
                </li>
                <li className="p-2.5 bg-slate-900 rounded-lg flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Bank statement (PDF) highlighting debit transaction and 12-digit UTR number.
                </li>
                <li className="p-2.5 bg-slate-900 rounded-lg flex items-center gap-2">
                  <span className="text-emerald-400 font-bold">✓</span> Screenshot of fraudulent APK, payment QR code, or website link.
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Emergency Hotlines: <strong className="text-white">1930</strong> (Cyber) | <strong className="text-white">112</strong> (Police Dispatch)
          </p>
          <div className="flex gap-2">
            {activeStep < 4 ? (
              <button
                onClick={() => {
                  setActiveStep((s) => s + 1);
                  cyberAudio.playBlip();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition"
              >
                Next Step →
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition"
              >
                Close Protocol
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
