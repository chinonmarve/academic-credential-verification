import React, { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell.jsx";
import { ErrorBanner, StatusBadge } from "../../components/Common.jsx";
import CertificateModal from "../../components/CertificateModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";
import { UNIVERSITY_NAV } from "./nav.js";

const STEPS = ["Student", "Academic Information", "Preview", "Processing", "Success"];

const EMPTY_ACADEMIC = {
  qualification: "",
  credentialType: "Bachelor's Degree",
  faculty: "",
  department: "",
  programme: "",
  graduationDate: "",
  gpa: "",
  dateOfBirth: ""
};

const PROCESSING_MESSAGES = [
  "Generating credential...",
  "Signing credential with issuer key...",
  "Generating salted attribute commitments...",
  "Computing credential hash...",
  "Recording hash on blockchain...",
  "Generating QR code...",
  "Creating verification reference..."
];

export default function IssueCredential() {
  const { token } = useAuth();
  const [step, setStep] = useState(0);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [academic, setAcademic] = useState(EMPTY_ACADEMIC);
  const [error, setError] = useState(null);
  const [issued, setIssued] = useState(null);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    api.getStudents(token).then((d) => setStudents(d.students)).catch((e) => setError(e.message));
  }, [token]);

  useEffect(() => {
    if (selectedStudent) {
      setAcademic((a) => ({ ...a, faculty: selectedStudent.faculty, department: selectedStudent.department, programme: selectedStudent.programme }));
    }
  }, [selectedStudent]);

  useEffect(() => {
    if (step !== 3) return;
    setProcessingIndex(0);
    const interval = setInterval(() => {
      setProcessingIndex((i) => {
        if (i >= PROCESSING_MESSAGES.length - 1) {
          clearInterval(interval);
          submit();
          return i;
        }
        return i + 1;
      });
    }, 450);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  async function submit() {
    try {
      const res = await api.issueCredential(token, { studentRecordId: selectedStudent.id, academic });
      setIssued(res.credential);
      setStep(4);
    } catch (e) {
      setError(e.message);
      setStep(1);
    }
  }

  function resetWizard() {
    setStep(0);
    setSelectedStudent(null);
    setAcademic(EMPTY_ACADEMIC);
    setIssued(null);
    setError(null);
  }

  const filteredStudents = students.filter((s) => `${s.fullName} ${s.studentId}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardShell navItems={UNIVERSITY_NAV} roleLabel="University Portal" pageTitle="Issue Credential">
      <ErrorBanner message={error} />

      <div className="flex flex-wrap gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            i === step ? "bg-accent-teal/10 text-accent-teal border border-accent-teal/30" : i < step ? "text-accent-green" : "text-slate-500"
          }`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${i <= step ? "bg-current text-navy-950" : "border border-slate-600"}`}>
              {i < step ? "✓" : i + 1}
            </span>
            {s}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="card p-6 max-w-2xl">
          <p className="text-white font-semibold mb-4">Select Student</p>
          <input className="input mb-4" placeholder="Search by name or student ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredStudents.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`w-full text-left flex items-center justify-between px-3 py-3 rounded-md border transition-colors ${
                  selectedStudent?.id === s.id ? "border-accent-teal/40 bg-accent-teal/5" : "border-white/5 hover:border-white/15"
                }`}
              >
                <span>
                  <span className="block text-sm font-medium text-slate-200">{s.fullName}</span>
                  <span className="block text-xs text-slate-500 mono">{s.studentId} · {s.programme}</span>
                </span>
                {selectedStudent?.id === s.id && <span className="text-accent-teal text-xs">Selected</span>}
              </button>
            ))}
            {filteredStudents.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">No students found. Register one first.</p>}
          </div>
          <button disabled={!selectedStudent} onClick={() => setStep(1)} className="btn-primary mt-5 w-full">
            Continue
          </button>
        </div>
      )}

      {step === 1 && (
        <form
          className="card p-6 max-w-2xl grid sm:grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
        >
          <p className="sm:col-span-2 text-white font-semibold">Academic Information</p>
          <div>
            <label className="label">Student Name</label>
            <input className="input" disabled value={selectedStudent.fullName} />
          </div>
          <div>
            <label className="label">Student ID</label>
            <input className="input" disabled value={selectedStudent.studentId} />
          </div>
          <div>
            <label className="label">Qualification</label>
            <input className="input" required value={academic.qualification} onChange={(e) => setAcademic({ ...academic, qualification: e.target.value })} placeholder="B.Sc. Computer Science (Second Class Upper)" />
          </div>
          <div>
            <label className="label">Credential Type</label>
            <select className="input" value={academic.credentialType} onChange={(e) => setAcademic({ ...academic, credentialType: e.target.value })}>
              <option>Bachelor's Degree</option>
              <option>Master's Degree</option>
              <option>Doctorate</option>
              <option>Diploma</option>
              <option>Certificate</option>
            </select>
          </div>
          <div>
            <label className="label">Faculty</label>
            <input className="input" value={academic.faculty} onChange={(e) => setAcademic({ ...academic, faculty: e.target.value })} />
          </div>
          <div>
            <label className="label">Department</label>
            <input className="input" value={academic.department} onChange={(e) => setAcademic({ ...academic, department: e.target.value })} />
          </div>
          <div>
            <label className="label">Programme</label>
            <input className="input" value={academic.programme} onChange={(e) => setAcademic({ ...academic, programme: e.target.value })} />
          </div>
          <div>
            <label className="label">Graduation Date</label>
            <input type="date" className="input" required value={academic.graduationDate} onChange={(e) => setAcademic({ ...academic, graduationDate: e.target.value })} />
          </div>
          <div>
            <label className="label">GPA (kept private / selectively disclosed)</label>
            <input className="input" value={academic.gpa} onChange={(e) => setAcademic({ ...academic, gpa: e.target.value })} placeholder="4.42" />
          </div>
          <div>
            <label className="label">Date of Birth (kept private / selectively disclosed)</label>
            <input type="date" className="input" value={academic.dateOfBirth} onChange={(e) => setAcademic({ ...academic, dateOfBirth: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button type="button" className="btn-secondary flex-1" onClick={() => setStep(0)}>Back</button>
            <button type="submit" className="btn-primary flex-1">Continue to Preview</button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div className="card p-6 max-w-2xl">
          <p className="text-white font-semibold mb-4">Credential Preview</p>
          <div className="rounded-md border border-white/10 bg-navy-900 p-5 space-y-3 text-sm">
            <Row label="Holder" value={selectedStudent.fullName} />
            <Row label="Issuer" value="Delta State University" />
            <Row label="Qualification" value={academic.qualification} />
            <Row label="Credential Type" value={academic.credentialType} />
            <Row label="Programme" value={academic.programme} />
            <Row label="Graduation Date" value={academic.graduationDate} />
            <Row label="Status" value={<StatusBadge status="pending" />} />
            <Row label="Holder DID" value={selectedStudent.did} mono />
          </div>
          <div className="flex gap-3 mt-5">
            <button className="btn-secondary flex-1" onClick={() => setStep(1)}>Back</button>
            <button className="btn-primary flex-1" onClick={() => setStep(3)}>Sign &amp; Issue Credential</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card p-8 max-w-lg text-center">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-accent-teal border-t-transparent animate-spin mb-6" />
          <p className="text-white font-semibold mb-1">Processing Credential</p>
          <div className="space-y-2 mt-5 text-left">
            {PROCESSING_MESSAGES.map((m, i) => (
              <p key={m} className={`text-sm flex items-center gap-2 ${i <= processingIndex ? "text-slate-300" : "text-slate-600"}`}>
                <span className={i <= processingIndex ? "text-accent-teal" : ""}>{i <= processingIndex ? "✓" : "○"}</span>
                {m}
              </p>
            ))}
          </div>
        </div>
      )}

      {step === 4 && issued && (
        <div className="card p-6 max-w-2xl">
          <p className="text-accent-green font-bold text-lg mb-1">Credential Successfully Issued</p>
          <p className="text-xs text-slate-500 mb-5">The credential now lives in the student's DID wallet.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-3 text-sm">
              <Row label="Credential ID" value={issued.credentialId} mono />
              <Row label="Holder DID" value={issued.studentDid} mono small />
              <Row label="Blockchain Hash" value={issued.credentialHash} mono small />
              <Row label="Transaction / Reference ID" value={issued.blockchainReference} mono small />
              <Row label="Block Number" value={issued.blockNumber} />
            </div>
            <div className="flex flex-col items-center justify-center bg-navy-900 rounded-md border border-white/10 p-4">
              <img src={issued.qrDataUrl} alt="Credential QR" className="w-40 h-40" />
              <p className="text-xs text-slate-500 mt-2">Scan to verify</p>
            </div>
          </div>
          <button onClick={() => setShowCertificate(true)} className="btn-primary w-full mt-6">
            Download Certificate
          </button>
          <button onClick={resetWizard} className="btn-secondary w-full mt-3">Issue Another Credential</button>
        </div>
      )}

      {showCertificate && issued && (
        <CertificateModal credential={issued} onClose={() => setShowCertificate(false)} />
      )}
    </DashboardShell>
  );
}

function Row({ label, value, mono, small }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-slate-500">{label}</span>
      <span className={`text-slate-200 text-right ${mono ? "mono" : ""} ${small ? "text-xs break-all max-w-[220px]" : ""}`}>{value}</span>
    </div>
  );
}
