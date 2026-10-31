import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

export default function SignupPage() {
  const { signup, loginGuest } = useAuth();
  const [email, setEmail]   = useState("");
  const [pass,  setPass]    = useState("");
  const [conf,  setConf]    = useState("");
  const [error, setError]   = useState("");
  const [busy,  setBusy]    = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (pass !== conf) { setError("Passwords do not match."); return; }
    if (pass.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setBusy(true);
    try { 
      await signup(email, pass); 
    } catch (err: any) {
      const msg = err.code === "auth/email-already-in-use"
        ? "An account with this email already exists."
        : (err.message || "Registration encountered an issue. Please try again.");
      setError(msg);
    } finally { 
      setBusy(false); 
    }
  }

  return (
    <AuthLayout title="Register Cyber Identity" subtitle="MP Police Threat Response Portal">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20
                        rounded-lg px-3 py-2">{error}</p>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">EMAIL ADDRESS</label>
          <input type="email" required value={email}
                 onChange={e => setEmail(e.target.value)}
                 placeholder="citizen@domain.com"
                 className="w-full bg-slate-950/60 border border-cyan-500/20 rounded-xl px-3.5
                            py-2.5 text-white placeholder-slate-600 text-sm
                            focus:outline-none focus:border-cyan-400 transition" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">SECURE PASSWORD</label>
          <input type="password" required value={pass}
                 onChange={e => setPass(e.target.value)}
                 placeholder="••••••••"
                 className="w-full bg-slate-950/60 border border-cyan-500/20 rounded-xl px-3.5
                            py-2.5 text-white placeholder-slate-600 text-sm
                            focus:outline-none focus:border-cyan-400 transition" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">CONFIRM PASSWORD</label>
          <input type="password" required value={conf}
                 onChange={e => setConf(e.target.value)}
                 placeholder="••••••••"
                 className="w-full bg-slate-950/60 border border-cyan-500/20 rounded-xl px-3.5
                            py-2.5 text-white placeholder-slate-600 text-sm
                            focus:outline-none focus:border-cyan-400 transition" />
        </div>
        <button type="submit" disabled={busy}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50
                           text-slate-950 font-bold py-2.5 rounded-xl text-sm
                           shadow-lg shadow-cyan-500/25 transition-all">
          {busy ? "Registering..." : "Create Cyber Account"}
        </button>

        <button
          type="button"
          onClick={() => loginGuest("Registered Citizen")}
          className="w-full bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300
                     font-semibold py-2.5 rounded-xl text-xs transition-all"
        >
          Quick Citizen Access (Instant Demo)
        </button>

        <p className="text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link to="/login" className="text-cyan-400 font-medium hover:text-cyan-300 transition">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}