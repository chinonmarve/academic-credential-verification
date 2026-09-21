import React from "react";
import { Link } from "react-router-dom";
import PublicNav from "../../components/PublicNav.jsx";

const ACTORS = [
  { title: "University", desc: "Issues digitally signed Verifiable Credentials and anchors their cryptographic hash on-chain.", icon: "M12 3 2 8l10 5 10-5-10-5Zm0 8-10 5 10 5 10-5-10-5Z" },
  { title: "Student", desc: "Owns a DID wallet holding the credential and decides exactly what to disclose when presenting it.", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" },
  { title: "Employer / Institution", desc: "Scans a QR code and receives a cryptographically verified result — no unnecessary data exposed.", icon: "M4 4h16v16H4V4Zm4 4h8v8H8V8Z" }
];

const FLOW = [
  "University issues credential",
  "Student receives credential in DID wallet",
  "Credential hash is secured on blockchain",
  "Student presents credential / QR code",
  "Verifier scans QR code",
  "System validates signature, blockchain hash and ZKP",
  "Verification result returned"
];

const TECH = ["Decentralised Identity (DID)", "Verifiable Credentials", "Blockchain Anchoring", "Zero-Knowledge Proof", "Issuer Signature (prototype)", "QR Verification", "Smart Contracts"];

const SECURITY = [
  { t: "Tamper Resistance", d: "Every credential hash is chained on the simulated blockchain — altering a credential breaks the chain." },
  { t: "Selective Disclosure", d: "Only attributes the holder explicitly selects are ever revealed to a verifier." },
  { t: "Credential Authenticity", d: "Issuer signatures are checked on every verification request." },
  { t: "Privacy Preservation", d: "Full academic records stay off-chain, inside the student's own DID wallet." },
  { t: "Decentralised Identity", d: "Students, not a central registrar, hold and present their own credentials." },
  { t: "Auditability", d: "Every issuance, presentation and verification event is recorded in the audit log." }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-navy-950">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(600px circle at 80% 0%, rgba(45,212,191,0.12), transparent 60%)" }} />
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-20 lg:py-28 relative">
          <span className="badge badge-slate mb-5">Decentralised Identity · Blockchain · Zero-Knowledge Proof</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight max-w-3xl leading-tight">
            Secure Academic Credential Verification
          </h1>
          <p className="text-slate-400 text-base lg:text-lg max-w-2xl mt-5 leading-relaxed">
            Verify academic credentials securely using Decentralised Identity, Verifiable Credentials, blockchain
            integrity, and privacy-preserving verification — without exposing more than what's required.
          </p>
          <div className="flex flex-wrap gap-3 mt-8">
            <Link to="/verify" className="btn-primary !px-6 !py-3 text-sm">Verify a Credential</Link>
            <Link to="/login" className="btn-secondary !px-6 !py-3 text-sm">Login to Dashboard</Link>
          </div>
        </div>
      </section>

      {/* Actors */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-accent-teal mb-2">How it works</h2>
        <p className="text-2xl font-bold text-white mb-10">Three actors, one trusted verification chain</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {ACTORS.map((a) => (
            <div key={a.title} className="card p-6">
              <div className="w-10 h-10 rounded-md bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.7" className="w-5 h-5">
                  <path d={a.icon} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-white font-semibold">{a.title}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>

        <div className="card p-6 lg:p-8 mt-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-4">
            {FLOW.map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex items-center gap-2.5 bg-navy-900 border border-white/5 rounded-md px-3 py-2">
                  <span className="w-5 h-5 rounded-full bg-accent-teal/15 text-accent-teal text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-300">{step}</span>
                </div>
                {i < FLOW.length - 1 && <span className="text-slate-600">→</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="border-t border-white/5 bg-navy-900/40">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-accent-teal mb-2">Technology</h2>
          <p className="text-2xl font-bold text-white mb-8">Built on privacy-preserving identity standards</p>
          <div className="flex flex-wrap gap-2.5">
            {TECH.map((t) => (
              <span key={t} className="badge badge-slate !py-2 !px-3.5 text-sm">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 py-16">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-accent-teal mb-2">Security</h2>
        <p className="text-2xl font-bold text-white mb-10">Designed around the research's security guarantees</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SECURITY.map((s) => (
            <div key={s.t} className="card p-5">
              <h3 className="text-white font-semibold text-sm">{s.t}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-16 text-center">
          <p className="text-2xl font-bold text-white">Ready to verify a credential?</p>
          <p className="text-slate-400 mt-2">Enter a credential ID, scan a QR code, or upload a QR image — no login required.</p>
          <Link to="/verify" className="btn-primary !px-7 !py-3 mt-6 inline-flex">Verify Credential</Link>
        </div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-600">
        ACV Platform — Software prototype for "Zero-Knowledge Proof-Enabled Decentralised Identity Framework for
        Secure and Privacy-Preserving Academic Credential Verification". Simulated blockchain &amp; ZKP layer.
      </footer>
    </div>
  );
}
