import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import jsQR from "jsqr";
import PublicNav from "../../components/PublicNav.jsx";
import { StepTimeline, StatusBadge, ErrorBanner, Loading } from "../../components/Common.jsx";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";

const METHODS = [
  { id: "id", label: "Enter Credential ID" },
  { id: "camera", label: "Scan QR Code" },
  { id: "upload", label: "Upload QR Image" }
];

// A scanned QR now encodes a real verification URL, e.g.
// https://your-domain.com/verify?id=CRED-XXXX (this app's own in-browser
// scanner still needs to pull the reference back out of that text). Older
// QR codes / test payloads that are plain JSON or a bare reference are also
// accepted for backward compatibility.
function decodeRefFromQrText(text) {
  const trimmed = (text || "").trim();
  try {
    const url = new URL(trimmed);
    const fromQuery = url.searchParams.get("ref") || url.searchParams.get("id");
    if (fromQuery) return fromQuery;
  } catch (e) {
    // not a URL, fall through
  }
  try {
    const parsed = JSON.parse(trimmed);
    return parsed.ref || trimmed;
  } catch (e) {
    return trimmed;
  }
}

export default function VerifyPublic() {
  const { token, user } = useAuth();
  const [searchParams] = useSearchParams();
  const [method, setMethod] = useState("id");
  const [credentialId, setCredentialId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Phone QR workflow: when a certificate's QR code is scanned with the
  // phone's normal camera app, it opens /verify?id=<id> directly in the
  // browser. Pick that reference up automatically on load and verify it,
  // with no extra taps needed.
  useEffect(() => {
    const ref = searchParams.get("ref") || searchParams.get("id");
    if (ref) {
      setCredentialId(ref);
      runVerification(ref);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runVerification(ref) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const isPresentation = ref.startsWith("PRES-");
      const payload = isPresentation ? { presentationId: ref } : { credentialId: ref };
      const res = await api.verifyCredential(payload, token);
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleIdSubmit(e) {
    e.preventDefault();
    if (!credentialId.trim()) return;
    runVerification(credentialId.trim());
  }

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
      scanLoop();
    } catch (e) {
      setError("Camera access was denied or is unavailable. Try Upload QR Image instead.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  function scanLoop() {
    if (!streamRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        stopCamera();
        const ref = decodeRefFromQrText(code.data);
        runVerification(ref);
        return;
      }
    }
    if (streamRef.current) requestAnimationFrame(scanLoop);
  }

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        runVerification(decodeRefFromQrText(code.data));
      } else {
        setError("No QR code could be read from that image. Try Enter Credential ID instead.");
      }
    };
    img.src = URL.createObjectURL(file);
  }

  function reset() {
    setResult(null);
    setError(null);
    setCredentialId("");
    stopCamera();
  }

  return (
    <div className="min-h-screen bg-navy-950">
      <PublicNav />
      <div className="max-w-3xl mx-auto px-4 lg:px-6 py-14">
        <span className="badge badge-slate mb-4">No login required</span>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white">Verify Academic Credential</h1>
        <p className="text-slate-400 mt-2 text-sm">
          {user ? `Verifying as ${user.name}. ` : ""}Choose a verification method below.
        </p>

        {!result && (
          <div className="card p-6 mt-8">
            <div className="flex flex-wrap gap-2 mb-6">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    stopCamera();
                    setMethod(m.id);
                    setError(null);
                  }}
                  className={`px-3.5 py-2 rounded-md text-sm font-medium border transition-colors ${
                    method === m.id ? "bg-accent-teal/10 text-accent-teal border-accent-teal/30" : "border-white/10 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <ErrorBanner message={error} />

            {method === "id" && (
              <form onSubmit={handleIdSubmit} className="space-y-4">
                <div>
                  <label className="label">Credential ID</label>
                  <input
                    className="input mono"
                    placeholder="CRED-XXXXXXXX-XXXXXXXX"
                    value={credentialId}
                    onChange={(e) => setCredentialId(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
                  {loading ? "Verifying..." : "Verify Credential"}
                </button>
              </form>
            )}

            {method === "camera" && (
              <div className="space-y-4">
                <div className="rounded-md overflow-hidden bg-navy-900 border border-white/10 aspect-video flex items-center justify-center">
                  <video ref={videoRef} className={`w-full h-full object-cover ${cameraActive ? "" : "hidden"}`} muted playsInline />
                  {!cameraActive && <p className="text-sm text-slate-500">Camera preview will appear here</p>}
                </div>
                <canvas ref={canvasRef} className="hidden" />
                {loading && <Loading label="Verifying scanned credential..." />}
                {!loading && (
                  <button onClick={cameraActive ? stopCamera : startCamera} className="btn-secondary w-full !py-3">
                    {cameraActive ? "Stop Camera" : "Start Camera"}
                  </button>
                )}
              </div>
            )}

            {method === "upload" && (
              <div className="space-y-4">
                <button onClick={() => fileInputRef.current?.click()} className="btn-secondary w-full !py-3">
                  Choose QR Image
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                {loading && <Loading label="Reading and verifying QR..." />}
              </div>
            )}
          </div>
        )}

        {result && <ResultCard result={result} onReset={reset} />}
      </div>
    </div>
  );
}

function ResultCard({ result, onReset }) {
  const isValid = result.finalResult === "VALID";
  const isRevoked = result.finalResult === "REVOKED";

  return (
    <div className="mt-8 space-y-5">
      <div className={`card p-6 border ${isValid ? "border-accent-green/30" : isRevoked ? "border-accent-amber/30" : "border-accent-red/30"}`}>
        <div className="flex items-center gap-3">
          <span
            className={`w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold ${
              isValid ? "bg-accent-green/10 text-accent-green" : isRevoked ? "bg-accent-amber/10 text-accent-amber" : "bg-accent-red/10 text-accent-red"
            }`}
          >
            {isValid ? "✓" : isRevoked ? "!" : "✕"}
          </span>
          <div>
            <p className="text-lg font-bold text-white">
              {isValid ? "CREDENTIAL VERIFIED" : isRevoked ? "CREDENTIAL REVOKED" : "CREDENTIAL VERIFICATION FAILED"}
            </p>
            <p className="text-xs text-slate-500 mono mt-0.5">Verification ID: {result.verificationId}</p>
          </div>
        </div>

        {result.reason && <p className="text-sm text-slate-400 mt-4">{result.reason}</p>}

        {result.credential && (
          <div className="grid sm:grid-cols-2 gap-4 mt-5 text-sm">
            <Field label="Credential Status"><StatusBadge status={result.finalResult} /></Field>
            <Field label="Credential ID">{result.credential.credentialId}</Field>
            <Field label="Qualification">{result.credential.qualification}</Field>
            <Field label="Issue Date">{new Date(result.credential.issueDate).toLocaleDateString()}</Field>
            <Field label="Credential Type">{result.credential.credentialType}</Field>
            <Field label="Verification Timestamp">{new Date(result.verifiedAt).toLocaleString()}</Field>
            {result.blockchain && <Field label="Blockchain Record" mono small>{result.blockchain.transactionHash}</Field>}
          </div>
        )}
      </div>

      <div className="card p-6">
        <p className="text-white font-semibold text-sm mb-4">Verification Process</p>
        <StepTimeline steps={result.steps} />
      </div>

      {Object.keys(result.disclosed || {}).length > 0 && (
        <div className="card p-6">
          <p className="text-white font-semibold text-sm mb-1">Information Disclosed</p>
          <p className="text-xs text-slate-500 mb-4">Only the attributes explicitly approved by the holder are shown below.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {Object.entries(result.disclosed).map(([k, v]) => (
              <div key={k} className="bg-navy-900 border border-white/5 rounded-md px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">{k.replace(/([A-Z])/g, " $1")}</p>
                <p className="text-sm text-slate-200 mt-0.5">{v}</p>
              </div>
            ))}
          </div>
          {result.proofEngine && <p className="text-[11px] text-slate-600 mt-4">{result.proofEngine}</p>}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button onClick={() => window.print()} className="btn-secondary">Download Verification Report</button>
        <button onClick={onReset} className="btn-primary">Verify Another Credential</button>
      </div>
    </div>
  );
}

function Field({ label, children, mono, small }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`text-slate-200 mt-0.5 ${mono ? "mono" : ""} ${small ? "text-xs break-all" : ""}`}>{children}</p>
    </div>
  );
}
