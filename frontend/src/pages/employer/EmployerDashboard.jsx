import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell.jsx";
import { StatCard, Loading, ErrorBanner, StatusBadge, EmptyState } from "../../components/Common.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";
import { EMPLOYER_NAV } from "./nav.js";

export default function EmployerDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.employerStats(token).then(setStats).catch((e) => setError(e.message));
    api.verificationHistory(token).then((d) => setHistory(d.history)).catch(() => {});
  }, [token]);

  return (
    <DashboardShell navItems={EMPLOYER_NAV} roleLabel="Employer / Verifier Portal" pageTitle="Verification Dashboard">
      <ErrorBanner message={error} />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-sm text-slate-400">Track your credential verification activity, or run a new check.</p>
        <Link to="/verify" className="btn-primary">Verify a Credential</Link>
      </div>

      {!stats ? (
        <Loading />
      ) : (
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Verifications" value={stats.totalVerifications} />
          <StatCard label="Successful" value={stats.successful} tone="green" />
          <StatCard label="Failed / Revoked" value={stats.failed} tone="red" />
        </div>
      )}

      <p className="text-white font-semibold text-sm mb-3">Recent Verification Activity</p>
      {!history ? (
        <Loading />
      ) : history.length === 0 ? (
        <EmptyState title="No verifications yet" subtitle="Results from Verify Credential will appear here." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-white/5">
                <th className="px-4 py-3">Credential ID</th>
                <th className="px-4 py-3">Disclosed Attributes</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 mono text-xs text-slate-400">{h.credentialId}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{h.disclosedAttributes.join(", ") || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={h.finalResult} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(h.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
