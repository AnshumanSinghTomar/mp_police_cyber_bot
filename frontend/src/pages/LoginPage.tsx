import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { ShieldAlert, Zap } from "lucide-react";

export default function LoginPage() {
  const { login, loginGuest } = useAuth();
  const [email, setEmail]   = useState("");
  const [pass,  setPass]    = useState("");
  const [error, setError]   = useState("");
  const [busy,  setBusy]    = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setBusy(true);
    try { 
      await login(email, pass); 
    } catch (err: any) { 
      setError(friendlyError(err.code || err.message)); 
    } finally { 
      setBusy(false); 
    }
  }

  return (
    <AuthLayout title="MP Cyber Command" subtitle="Law Enforcement & Citizen Defense System">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/30
                        rounded-lg px-3 py-2 flex items-center gap-2">
            <ShieldAlert size={14} className="shrink-0" />
            <span>{error}</span>
          </p>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 tracking-wide">
            OFFICER / USER EMAIL
          </label>
          <input type="email" required value={email}
                 onChange={e => setEmail(e.target.value)}
                 placeholder="officer@mppolice.gov.in"
                 className="w-full bg-slate-950/60 border border-cyan-500/20 rounded-xl px-3.5
                            py-2.5 text-white placeholder-slate-600 text-sm
                            focus:outline-none focus:border-cyan-400
                            focus:ring-1 focus:ring-cyan-400/40 transition" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-400 tracking-wide">PASSWORD</label>
            <Link to="/forgot-password"
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition">
              Forgot?
            </Link>
          </div>
          <input type="password" required value={pass}
                 onChange={e => setPass(e.target.value)}
                 placeholder="••••••••"
                 className="w-full bg-slate-950/60 border border-cyan-500/20 rounded-xl px-3.5
                            py-2.5 text-white placeholder-slate-600 text-sm
                            focus:outline-none focus:border-cyan-400
                            focus:ring-1 focus:ring-cyan-400/40 transition" />
        </div>
        <button type="submit" disabled={busy}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50
                           text-slate-950 font-bold py-2.5 rounded-xl text-sm
                           shadow-lg shadow-cyan-500/25 transition-all duration-200 
                           flex items-center justify-center gap-2">
          {busy ? <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent
                                   rounded-full animate-spin" /> : null}
          {busy ? "Authenticating..." : "Authorize Access"}
        </button>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase">
            <span className="bg-slate-900 px-2 text-slate-500 font-semibold tracking-wider">
              Or Fast Bypass
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loginGuest("Inspector General (Cyber Command)")}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300
                     font-semibold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
        >
          <Zap size={14} className="text-cyan-400" />
          <span>Quick Officer Access (Demo Mode)</span>
        </button>

        <p className="text-center text-xs text-slate-500 pt-1">
          New citizen/officer?{" "}
          <Link to="/signup" className="text-cyan-400 font-medium hover:text-cyan-300 transition">
            Register ID
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function friendlyError(code: string) {
  const map: Record<string, string> = {
    "auth/user-not-found":   "No account found with this email. Please register first.",
    "auth/wrong-password":   "Incorrect password. Please verify and try again.",
    "auth/invalid-email":    "Please enter a valid email address.",
    "auth/too-many-requests":"Too many attempts. Please try again later.",
    "auth/invalid-credential":"Invalid email or password.",
  };
  return map[code] ?? (code || "Authentication error.");
}