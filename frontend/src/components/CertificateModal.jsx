import React, { useRef, useState } from "react";
import Certificate from "./Certificate.jsx";
import { normalizeCredentialForCertificate } from "../utils/certificateData.js";
import { downloadCertificateAsPdf } from "../utils/downloadCertificate.js";

export default function CertificateModal({ credential, onClose }) {
  const data = normalizeCredentialForCertificate(credential);
  const certRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      await downloadCertificateAsPdf(certRef.current, `${data.credentialId}-certificate.pdf`);
    } catch (e) {
      setError(e.message || "Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
      <div className="card w-full max-w-4xl my-8">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <p className="text-white font-semibold text-sm">Certificate Preview</p>
            <p className="text-xs text-slate-500 mono mt-0.5">A4 landscape · {data.credentialId}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 text-xl leading-none">×</button>
        </div>

        <div className="p-5 overflow-x-auto bg-navy-950/40">
          {error && <p className="text-xs text-accent-red mb-3">{error}</p>}
          <div className="mx-auto shadow-2xl" style={{ width: "fit-content" }}>
            <Certificate ref={certRef} data={data} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-t border-white/5">
          <button onClick={onClose} className="btn-secondary flex-1">Close</button>
          <button onClick={handleDownload} disabled={downloading} className="btn-primary flex-1">
            {downloading ? "Preparing PDF..." : "Download Certificate (PDF)"}
          </button>
        </div>
      </div>
    </div>
  );
}
