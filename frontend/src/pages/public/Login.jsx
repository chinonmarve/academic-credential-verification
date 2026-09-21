import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import PublicNav from "../../components/PublicNav.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { ErrorBanner } from "../../components/Common.jsx";

const DEMO_ACCOUNTS = [
  { role: "University", email: "admin@delsu.edu.ng", password: "University@123" },
  { role: "Student", email: "student@delsu.edu.ng", password: "Student@123" },
  { role: "Employer", email: "verifier@marveltech.com", password: "Employer@123" }
];

const ROUTE_BY_ROLE = {
  university: "/university/dashboard",
  student: "/student/wallet",
  employer: "/employer/dashboard"
};

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(email, password);
      navigate(ROUTE_BY_ROLE[user.role] || "/");
    } catch (err) {
      setError(err.message);
    }
  }

  function fillDemo(acc) {
    setEmail(acc.email);
    setPassword(acc.password);
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <PublicNav />
      <div className="flex-1 grid lg:grid-cols-2">
        {/* Visual / brand section */}
        <div className="hidden lg:flex relative overflow-hidden bg-navy-900 border-r border-white/5 items-center justify-center p-12">
          <div className="absolute inset-0" style={{ background: "radial-gradient(500px circle at 30% 20%, rgba(45,212,191,0.10), transparent 60%)" }} />
          <div className="relative max-w-md">
            <span className="badge badge-slate mb-6">Enterprise Identity Platform</span>
            <h2 className="text-2xl font-bold text-white leading-snug">
              Decentralised Identity meets cryptographic proof.
            </h2>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              Universities issue signed Verifiable Credentials. Students hold them in a private DID wallet. Employers
              verify authenticity in seconds — without ever seeing more than what's been explicitly disclosed.
            </p>

            <svg viewBox="0 0 400 260" className="mt-10 w-full">
              <rect x="10" y="20" width="110" height="70" rx="8" fill="none" stroke="#1E3564" strokeWidth="1.5" />
              <text x="65" y="60" fill="#94A3B8" fontSize="11" textAnchor="middle">University</text>
              <rect x="145" y="95" width="110" height="70" rx="8" fill="none" stroke="#2DD4BF" strokeWidth="1.5" />
              <text x="200" y="135" fill="#2DD4BF" fontSize="11" textAnchor="middle">DID Wallet</text>
              <rect x="280" y="20" width="110" height="70" rx="8" fill="none" stroke="#1E3564" strokeWidth="1.5" />
              <text x="335" y="60" fill="#94A3B8" fontSize="11" textAnchor="middle">Employer</text>
              <rect x="145" y="190" width="110" height="55" rx="8" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
              <text x="200" y="222" fill="#38BDF8" fontSize="11" textAnchor="middle">Blockchain</text>
              <path d="M65 90 L180 100" stroke="#334155" strokeWidth="1.2" markerEnd="url(#arrow)" />
              <path d="M255 130 L335 90" stroke="#334155" strokeWidth="1.2" markerEnd="url(#arrow)" />
              <path d="M200 165 L200 190" stroke="#334155" strokeWidth="1.2" markerEnd="url(#arrow)" />
              <defs>
                <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L6,3 L0,6 Z" fill="#334155" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>

        {/* Auth form section */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm">
            <h1 className="text-xl font-bold text-white">Login to your dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Access your University, Student, or Employer portal.</p>

            <ErrorBanner message={error} />

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@institution.edu" />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    className="input pr-16"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
                {loading ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
              <Link to="/" className="hover:text-slate-300">Home</Link>
              <span>·</span>
              <Link to="/verify" className="hover:text-slate-300">Verify Credential</Link>
            </div>

            <div className="mt-8 card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Demo accounts</p>
              <div className="space-y-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className="w-full flex items-center justify-between text-left px-3 py-2 rounded-md bg-navy-900 border border-white/5 hover:border-accent-teal/30 transition-colors"
                  >
                    <span>
                      <span className="block text-xs font-semibold text-slate-200">{acc.role}</span>
                      <span className="block text-[11px] text-slate-500 mono">{acc.email}</span>
                    </span>
                    <span className="text-[10px] text-accent-teal">Use</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
