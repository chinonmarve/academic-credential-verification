import React, { forwardRef } from "react";
import { formatCertificateDate } from "../utils/certificateDate.js";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Arial, Helvetica, sans-serif";
const NAVY = "#17365D";
const BLUE = "#2C78B8";
const GOLD = "#B88A2A";
const INK = "#18212B";

function SignatureBlock({ title }) {
  return (
    <div style={{ width: 270, textAlign: "center" }}>
      <div style={{ height: 48, borderBottom: `1.4px solid ${INK}`, marginBottom: 8 }} />
      <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</div>
      <div style={{ fontFamily: SANS, fontSize: 10, color: "#6B7280", marginTop: 3 }}>Signature</div>
    </div>
  );
}

const Certificate = forwardRef(function Certificate({ data }, ref) {
  const { day, month, year } = formatCertificateDate(data.issueDate);
  const isRevoked = data.status === "revoked";

  return (
    <div ref={ref} style={{ width: 1123, height: 794, boxSizing: "border-box", position: "relative", background: "#FBFAF5", color: INK, fontFamily: SERIF, padding: 18 }}>
      <div style={{ position: "absolute", inset: 18, border: `3px solid ${NAVY}` }} />
      <div style={{ position: "absolute", inset: 28, border: `1px solid ${GOLD}` }} />
      <div style={{ position: "absolute", inset: 40, border: `1px solid rgba(23,54,93,.28)` }} />

      {/* restrained academic ornament */}
      <div style={{ position: "absolute", top: 29, left: 29, width: 34, height: 34, borderTop: `3px solid ${GOLD}`, borderLeft: `3px solid ${GOLD}` }} />
      <div style={{ position: "absolute", top: 29, right: 29, width: 34, height: 34, borderTop: `3px solid ${GOLD}`, borderRight: `3px solid ${GOLD}` }} />
      <div style={{ position: "absolute", bottom: 29, left: 29, width: 34, height: 34, borderBottom: `3px solid ${GOLD}`, borderLeft: `3px solid ${GOLD}` }} />
      <div style={{ position: "absolute", bottom: 29, right: 29, width: 34, height: 34, borderBottom: `3px solid ${GOLD}`, borderRight: `3px solid ${GOLD}` }} />

      {isRevoked && (
        <div style={{ position: "absolute", zIndex: 8, top: "42%", left: "50%", transform: "translate(-50%, -50%) rotate(-12deg)", border: "7px solid #B91C1C", color: "#B91C1C", fontFamily: SANS, fontSize: 58, fontWeight: 800, padding: "6px 36px", opacity: 0.16, letterSpacing: "0.14em", whiteSpace: "nowrap" }}>
          REVOKED
        </div>
      )}

      <div style={{ position: "relative", zIndex: 2, height: "100%", padding: "34px 76px 30px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
        <header style={{ textAlign: "center" }}>
          <img src="/assets/delsu-logo.jpg" alt="Delta State University official logo" style={{ width: 110, height: 92, objectFit: "contain", display: "block", margin: "0 auto 5px" }} />
          <div style={{ fontFamily: SANS, fontSize: 25, fontWeight: 800, letterSpacing: "0.16em", color: NAVY }}>DELTA STATE UNIVERSITY</div>
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: "0.28em", color: "#4B5563", marginTop: 4 }}>ABRAKA, NIGERIA</div>
          <div style={{ fontFamily: SANS, fontSize: 10, letterSpacing: "0.2em", color: BLUE, marginTop: 5 }}>KNOWLEDGE • CHARACTER • SERVICE</div>
          <div style={{ width: 170, height: 2, background: GOLD, margin: "10px auto 8px" }} />
          <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: "0.3em", color: "#6B5B2D", textTransform: "uppercase" }}>Certificate of Academic Award</div>
        </header>

        <main style={{ flex: 1, textAlign: "center", paddingTop: 18 }}>
          <div style={{ fontFamily: SERIF, fontSize: 15, color: "#4B5563" }}>This is to certify that</div>
          <div style={{ fontFamily: SERIF, fontSize: 32, fontWeight: 700, color: NAVY, marginTop: 7, lineHeight: 1.1 }}>{data.studentName || "—"}</div>
          <div style={{ width: 390, borderBottom: `1px solid ${GOLD}`, margin: "7px auto 11px" }} />
          <div style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, maxWidth: 800, margin: "0 auto" }}>
            having satisfactorily completed the approved course of study and fulfilled the requirements for the award of the
          </div>
          <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: NAVY, marginTop: 7 }}>{data.qualification || "—"}</div>
          <div style={{ fontFamily: SERIF, fontSize: 14, marginTop: 3 }}>in</div>
          <div style={{ fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: NAVY, marginTop: 3 }}>{data.programme || "—"}</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, maxWidth: 860, margin: "18px auto 0", textAlign: "left" }}>
            <Info label="Matriculation No." value={data.matricNumber} />
            <Info label="Graduation Year" value={data.graduationYear} />
            <Info label="Credential ID" value={data.credentialId} mono />
            <Info label="Status" value={isRevoked ? "REVOKED" : "VALID"} status={isRevoked ? "revoked" : "valid"} />
          </div>

          <div style={{ fontSize: 13, marginTop: 15 }}>Issued on <strong>{day} {month}, {year}</strong>.</div>
        </main>

        <footer style={{ display: "grid", gridTemplateColumns: "1fr 160px 1fr", alignItems: "end", gap: 25, marginTop: 10 }}>
          <SignatureBlock title="Vice-Chancellor" />
          <div style={{ textAlign: "center" }}>
            {data.qrDataUrl ? <img src={data.qrDataUrl} alt="Credential verification QR code" width={102} height={102} style={{ display: "block", margin: "0 auto" }} /> : <div style={{ width: 102, height: 102, border: "1px solid #CBD5E1", margin: "0 auto" }} />}
            <div style={{ fontFamily: SANS, fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", color: NAVY, marginTop: 5 }}>SCAN TO VERIFY</div>
          </div>
          <SignatureBlock title="Registrar" />
        </footer>

        <div style={{ textAlign: "center", fontFamily: SANS, fontSize: 8, color: "#6B7280", marginTop: 7, letterSpacing: "0.04em" }}>
          Digital verification reference • {data.credentialId}
        </div>
      </div>
    </div>
  );
});

function Info({ label, value, mono, status }) {
  return (
    <div style={{ borderTop: `1px solid #D7DEE7`, paddingTop: 5 }}>
      <div style={{ fontFamily: SANS, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6B7280" }}>{label}</div>
      <div style={{ fontFamily: mono ? "ui-monospace, SFMono-Regular, Menlo, monospace" : SANS, fontSize: mono ? 8 : 10, fontWeight: 700, color: status === "revoked" ? "#B91C1C" : status === "valid" ? "#166534" : NAVY, marginTop: 2, overflowWrap: "anywhere" }}>{value || "—"}</div>
    </div>
  );
}

export default Certificate;
