import React, { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell.jsx";
import { Loading, ErrorBanner, EmptyState } from "../../components/Common.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";
import { UNIVERSITY_NAV } from "./nav.js";

export default function AuditLogs() {
  const { token } = useAuth();
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.universityAuditLogs(token).then((d) => setLogs(d.logs)).catch((e) => setError(e.message));
  }, [token]);

  return (
    <DashboardShell navItems={UNIVERSITY_NAV} roleLabel="University Portal" pageTitle="Audit Logs">
      <ErrorBanner message={error} />
      {!logs ? (
        <Loading />
      ) : logs.length === 0 ? (
        <EmptyState title="No audit activity yet" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-white/5">
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Credential ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 text-slate-200">{l.event}</td>
                  <td className="px-4 py-3 text-slate-400">{l.userLabel}</td>
                  <td className="px-4 py-3 mono text-xs text-slate-500">{l.credentialId || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${l.result === "success" || l.result === "valid" ? "badge-green" : l.result === "info" ? "badge-slate" : "badge-red"}`}>
                      {l.result}
                    </span>
                  </td>
                  <td className="px-4 py-3 mono text-xs text-slate-500 max-w-[160px] truncate" title={l.reference}>{l.reference || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
