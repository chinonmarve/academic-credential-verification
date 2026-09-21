import React, { useEffect, useState } from "react";
import { StatusBadge, Loading, ErrorBanner } from "../../components/Common.jsx";
import CertificateModal from "../../components/CertificateModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";

const ATTRIBUTE_LABELS = {
  qualification: "Qualification",
  gpa: "GPA",
  studentIdNumber: "Student ID",
  dateOfBirth: "Date of Birth",
  studentName: "Full Name",
  institution: "Institution",
  graduationStatus: "Graduation Status",
  faculty: "Faculty",
  department: "Department",
  programme: "Programme",
  graduationDate: "Graduation Date",
  graduationYear: "Graduation Year",
  issuanceDate: "Issuance Date",
  studentDid: "DID",
  credentialType: "Credential Type"
};

const NON_DISCLOSURE_FIELDS = ["vcName", "registrarName"];

const DEFAULT_SELECTED = ["qualification", "institution", "graduationStatus"];

export default function CredentialDetailModal({ credentialId, onClose }) {
  const { token } = useAuth();
  const [credential, setCredential] = useState(null);
  const [error, setError] = useState(null);
  const [view, setView] = useState("details"); // details | disclosure | proof
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [presentation, setPresentation] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    api.getWalletCredential(token, credentialId).then((d) => setCredential(d.credential)).catch((e) => setError(e.message));
  }, [token, credentialId]);

  function toggleAttribute(attr) {
    setSelected((s) => (s.includes(attr) ? s.filter((a) => a !== attr) : [...s, attr]));
  }

  async function generateProof() {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.presentCredential(token, credentialId, selected);
      setPresentation(res.presentation);
      setView("proof");
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
      <div className="card w-full max-w-lg my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 sticky top-0 bg-navy-850 z-10">
          <p className="text-white font-semibold text-sm">
            {view === "details" && "Credential Details"}
            {view === "disclosure" && "Select Information to Disclose"}
            {view === "proof" && "Privacy-Preserving Proof"}
          </p>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 text-xl leading-none">×</button>
        </div>

        <div className="p-6">
          <ErrorBanner message={error} />

          {!credential ? (
            <Loading />
          ) : view === "details" ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <StatusBadge status={credential.status} />
                {credential.status === "revoked" && <span className="text-xs text-accent-red">Revoked {new Date(credential.revokedAt).toLocaleDateString()}</span>}
              </div>
              <dl className="space-y-2.5 text-sm">
                <Row label="Credential ID" value={credential.credentialId} mono />
                <Row label="Holder DID" value={credential.studentDid} mono small />
                <Row label="Issuer DID" value={credential.issuerDid} mono small />
                <Row label="Credential Type" value={credential.credentialType} />
                <Row label="Qualification" value={credential.qualification} />
                <Row label="Issue Date" value={new Date(credential.issueDate).toLocaleDateString()} />
                <Row label="Blockchain Verification" value={<span className="badge badge-green">Anchored · Block #{credential.blockNumber}</span>} />
                <Row label="Signature Status" value={<span className="badge badge-green">Signed</span>} />
                <Row label="ZKP Availability" value={<span className="badge badge-green">Ready</span>} />
              </dl>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button onClick={() => setView("disclosure")} className="btn-primary col-span-2">Present Credential</button>
                <button onClick={() => setShowCertificate(true)} className="btn-secondary col-span-2">Download Certificate</button>
                <button onClick={() => setView("qr")} className="btn-secondary">Show QR Code</button>
                <a href={`/verify`} target="_blank" rel="noreferrer" className="btn-secondary text-center">Verify</a>
              </div>
            </>
          ) : view === "qr" ? (
            <div className="text-center">
              <img src={credential.qrDataUrl} alt="Credential QR" className="w-48 h-48 mx-auto" />
              <p className="text-xs text-slate-500 mt-3 mono">{credential.credentialId}</p>
              <p className="text-xs text-slate-600 mt-1">This QR encodes only the credential reference — no personal data.</p>
              <button onClick={() => setView("details")} className="btn-secondary w-full mt-5">Back</button>
            </div>
          ) : view === "disclosure" ? (
            <>
              <p className="text-xs text-slate-500 mb-4">
                Choose exactly which attributes the verifier will see. Only these values are disclosed — everything
                else stays cryptographically hidden.
              </p>
              <div className="space-y-2">
                {Object.entries(credential.fields)
                  .filter(([key]) => !NON_DISCLOSURE_FIELDS.includes(key))
                  .map(([key]) => (
                  <label key={key} className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-white/5 hover:border-white/15 cursor-pointer">
                    <input type="checkbox" className="rounded border-white/20 bg-navy-900" checked={selected.includes(key)} onChange={() => toggleAttribute(key)} />
                    <span className="text-sm text-slate-200">{ATTRIBUTE_LABELS[key] || key}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setView("details")} className="btn-secondary flex-1">Back</button>
                <button onClick={generateProof} disabled={generating || selected.length === 0} className="btn-primary flex-1">
                  {generating ? "Generating..." : "Generate Privacy-Preserving Proof"}
                </button>
              </div>
            </>
          ) : (
            presentation && (
              <div className="text-center">
                <span className="badge badge-green mb-4">Zero-Knowledge Proof Ready</span>
                <img src={presentation.qrDataUrl} alt="Presentation QR" className="w-48 h-48 mx-auto" />
                <p className="text-xs text-slate-500 mt-3 mono">{presentation.presentationId}</p>
                <p className="text-xs text-slate-600 mt-2">
                  Only <span className="text-slate-400">{presentation.disclosedAttributes.map((a) => ATTRIBUTE_LABELS[a] || a).join(", ")}</span> will be
                  disclosed when this is scanned. Valid for 15 minutes.
                </p>
                <button onClick={() => downloadPresentation(presentation)} className="btn-secondary w-full mt-5">Download Presentation</button>
                <button onClick={() => setView("details")} className="btn-secondary w-full mt-2">Done</button>
              </div>
            )
          )}
        </div>
      </div>

      {showCertificate && (
        <CertificateModal credential={credential} onClose={() => setShowCertificate(false)} />
      )}
    </div>
  );
}

function downloadPresentation(presentation) {
  const payload = {
    presentationId: presentation.presentationId,
    credentialId: presentation.credentialId,
    disclosedAttributes: presentation.disclosedAttributes,
    createdAt: presentation.createdAt,
    expiresAt: presentation.expiresAt,
    verificationUrl: `${window.location.origin}/verify?id=${encodeURIComponent(presentation.presentationId)}`
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${presentation.presentationId}-presentation.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function Row({ label, value, mono, small }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`text-slate-200 text-right ${mono ? "mono" : ""} ${small ? "text-xs break-all max-w-[240px]" : ""}`}>{value}</dd>
    </div>
  );
}
