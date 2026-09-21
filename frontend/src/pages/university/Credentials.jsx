import React, { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell.jsx";
import { Loading, ErrorBanner, StatusBadge, EmptyState } from "../../components/Common.jsx";
import CertificateModal from "../../components/CertificateModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";
import { UNIVERSITY_NAV } from "./nav.js";

export default function Credentials() {
  const { token } = useAuth();
  const [credentials, setCredentials] = useState(null);
  const [error, setError] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [certTarget, setCertTarget] = useState(null);

  function load() {
    api.getIssuedCredentials(token).then((d) => setCredentials(d.credentials)).catch((e) => setError(e.message));
  }
  useEffect(load, [token]);

  async function handleRevoke() {
    setBusy(true);
    setError(null);
    try {
      await api.revokeCredential(token, revokeTarget.credentialId, reason || "Not specified");
      setRevokeTarget(null);
      setReason("");
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardShell navItems={UNIVERSITY_NAV} roleLabel="University Portal" pageTitle="Credentials">
      <ErrorBanner message={error} />
      {!credentials ? (
        <Loading />
      ) : credentials.length === 0 ? (
        <EmptyState title="No credentials issued yet" subtitle="Use Issue Credential to create one." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-white/5">
                <th className="px-4 py-3">Credential ID</th>
                <th className="px-4 py-3">Qualification</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3">Blockchain Hash</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 mono text-xs text-slate-400">{c.credentialId}</td>
                  <td className="px-4 py-3 text-slate-200">{c.qualification}</td>
                  <td className="px-4 py-3 text-slate-400">{c.credentialType}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(c.issueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 mono text-xs text-slate-500 max-w-[160px] truncate" title={c.credentialHash}>{c.credentialHash}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setCertTarget(c)} className="text-xs text-accent-teal hover:underline">
                        Certificate
                      </button>
                      {c.status === "active" && (
                        <button onClick={() => setRevokeTarget(c)} className="text-xs text-accent-red hover:underline">
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {revokeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="card p-6 w-full max-w-sm">
            <p className="text-white font-semibold">Revoke Credential</p>
            <p className="text-xs text-slate-500 mono mt-1">{revokeTarget.credentialId}</p>
            <label className="label mt-4">Reason</label>
            <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Issued in error" />
            <div className="flex gap-3 mt-5">
              <button className="btn-secondary flex-1" onClick={() => setRevokeTarget(null)}>Cancel</button>
              <button className="btn-danger flex-1" disabled={busy} onClick={handleRevoke}>
                {busy ? "Revoking..." : "Confirm Revoke"}
              </button>
            </div>
          </div>
        </div>
      )}

      {certTarget && <CertificateModal credential={certTarget} onClose={() => setCertTarget(null)} />}
    </DashboardShell>
  );
}
