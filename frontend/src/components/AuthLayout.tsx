import type { ReactNode } from "react";

export default function AuthLayout({
  children, title, subtitle
}: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4
                    relative overflow-hidden">
      {/* animated grid bg */}
      <div className="absolute inset-0 opacity-10"
           style={{ backgroundImage:
             "linear-gradient(rgba(6,182,212,0.3) 1px, transparent 1px)," +
             "linear-gradient(90deg, rgba(6,182,212,0.3) 1px, transparent 1px)",
             backgroundSize: "48px 48px",
             animation: "gridMove 20s linear infinite"
           }} />
      <div className="absolute inset-0"
           style={{ background:
             "radial-gradient(ellipse at 20% 50%, rgba(6,182,212,0.07) 0%, transparent 60%)," +
             "radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.07) 0%, transparent 60%)" }} />
      <div className="relative z-10 w-full max-w-md">
        {/* logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
                          bg-cyan-500/10 border border-cyan-500/20 mb-4 shadow-lg shadow-cyan-500/20">
            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0
                       013.598 6 11.955 11.955 0 01.75 9.448c0 5.848 3.992
                       10.84 9.46 12.269a.75.75 0 00.54 0c5.468-1.43 9.46-6.42
                       9.46-12.27 0-1.28-.196-2.513-.557-3.674A11.96 11.96 0
                       0112 2.714z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
          <p className="text-gray-400 text-sm mt-1">{subtitle}</p>
        </div>
        {/* glass card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20
                        rounded-2xl p-8 shadow-2xl shadow-cyan-950/50">
          {children}
        </div>
      </div>
      <style>{`@keyframes gridMove { from{background-position:0 0} to{background-position:48px 48px} }`}</style>
    </div>
  );
}