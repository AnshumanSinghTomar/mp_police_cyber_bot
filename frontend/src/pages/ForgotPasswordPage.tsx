import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [msg,   setMsg]   = useState("");
  const [error, setError] = useState("");
  const [busy,  setBusy]  = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setMsg(""); setBusy(true);
    try {
      await resetPassword(email);
      setMsg("Password reset email sent. Check your inbox.");
    } catch { 
      setError("Could not send reset email. In sandbox mode, use quick login."); 
    } finally { 
      setBusy(false); 
    }
  }

  return (
    <AuthLayout title="Reset Cyber Credentials" subtitle="Secure authentication recovery">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-400 text-xs bg-red-400/10 border
                               border-red-400/20 rounded-lg px-3 py-2">{error}</p>}
        {msg &&   <p className="text-emerald-400 text-xs bg-emerald-400/10 border
                               border-emerald-400/20 rounded-lg px-3 py-2">{msg}</p>}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">REGISTERED EMAIL</label>
          <input type="email" required value={email}
                 onChange={e => setEmail(e.target.value)}
                 placeholder="officer@mppolice.gov.in"
                 className="w-full bg-slate-950/60 border border-cyan-500/20 rounded-xl px-3.5
                            py-2.5 text-white placeholder-slate-600 text-sm
                            focus:outline-none focus:border-cyan-400 transition" />
        </div>
        <button type="submit" disabled={busy}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50
                           text-slate-950 font-bold py-2.5 rounded-xl text-sm
                           shadow-lg shadow-cyan-500/25 transition-all">
          {busy ? "Sending Instructions..." : "Send Recovery Dispatch"}
        </button>
        <p className="text-center text-xs text-slate-500">
          Remember password?{" "}
          <Link to="/login" className="text-cyan-400 font-medium hover:text-cyan-300 transition">
            Return to login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}