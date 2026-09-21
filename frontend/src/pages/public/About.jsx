import React from "react";
import PublicNav from "../../components/PublicNav.jsx";

const QA = [
  { q: "Who issues the credential?", a: "The university (credential issuer) creates and digitally signs a Verifiable Credential once a student meets graduation requirements." },
  { q: "Who owns the credential?", a: "The student. Once issued, the full credential lives in the student's own Decentralised Identity (DID) wallet, not in a university-controlled database." },
  { q: "Where is the credential stored?", a: "The complete credential stays off-chain in the holder's wallet. Only a cryptographic hash of the credential is anchored on the blockchain." },
  { q: "How is the credential protected?", a: "An issuer digital signature, a salted attribute-commitment hash, and an immutable blockchain anchor together make the credential tamper-evident." },
  { q: "How is the blockchain involved?", a: "A simulated Ethereum-compatible smart-contract layer stores the credential's hash and every revocation event, forming a chained, auditable record." },
  { q: "How does QR verification work?", a: "Each credential (or selective-disclosure presentation) gets a QR code encoding only a safe reference ID — never personal data — that a verifier scans or uploads." },
  { q: "How does Zero-Knowledge Proof protect privacy?", a: "The holder chooses which attributes to disclose. The verifier can confirm those attributes are genuinely part of the signed credential without ever seeing the undisclosed ones." },
  { q: "How does the employer verify the credential?", a: "The employer submits the credential ID or scanned QR reference to the verification portal, which checks the signature, hash, status and proof, then returns Valid, Invalid, or Revoked." },
  { q: "What happens when a credential is revoked?", a: "The university marks the credential revoked and records a revocation event on-chain. Any future verification attempt immediately returns REVOKED." }
];

export default function About() {
  return (
    <div className="min-h-screen bg-navy-950">
      <PublicNav />
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-16">
        <span className="badge badge-slate mb-4">About the System</span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          A Zero-Knowledge Proof-Enabled Decentralised Identity Framework
        </h1>
        <p className="text-slate-400 mt-4 leading-relaxed">
          This platform is the software prototype for the academic research work of the same title. It replaces
          slow, centralised, manual credential verification with a Decentralised Identity (DID) model, Verifiable
          Credentials signed by the issuing institution, a blockchain-anchored integrity record, and a
          Zero-Knowledge-style selective disclosure layer — so a verifier can confirm a credential is genuine
          without seeing more of a student's record than necessary.
        </p>

        <div className="mt-10 space-y-3">
          {QA.map((item) => (
            <div key={item.q} className="card p-5">
              <p className="text-white font-semibold text-sm">{item.q}</p>
              <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="card p-5 mt-8 border-accent-amber/20">
          <p className="text-accent-amber text-xs font-semibold uppercase tracking-wide mb-1">Prototype Notice</p>
          <p className="text-sm text-slate-400 leading-relaxed">
            This is an academic prototype. The blockchain is a locally simulated, Ethereum-compatible chain (no real
            network is contacted), and the Zero-Knowledge layer is implemented as a salted attribute-commitment
            selective-disclosure scheme rather than a production zk-SNARK/BBS+ circuit. Both are clearly labelled
            throughout the interface. The service layer is modular so either can be swapped for production-grade
            cryptography without changing the surrounding application.
          </p>
        </div>
      </div>
    </div>
  );
}
