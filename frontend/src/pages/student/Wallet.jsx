import React, { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell.jsx";
import { Loading, ErrorBanner, StatusBadge, StatCard, EmptyState } from "../../components/Common.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";
import { STUDENT_NAV } from "./nav.js";
import CredentialDetailModal from "./CredentialDetailModal.jsx";

export default function Wallet() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [openCredentialId, setOpenCredentialId] = useState(null);

  function load() {
    api.getWallet(token).then(setData).catch((e) => setError(e.message));
    api.studentStats(token).then(setStats).catch(() => {});
  }
  useEffect(load, [token]);

  return (
    <DashboardShell navItems={STUDENT_NAV} roleLabel="Student Portal" pageTitle="Digital Credential Wallet">
      <ErrorBanner message={error} />

      {stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Credentials Held" value={stats.credentialsHeld} />
          <StatCard label="Active Credentials" value={stats.activeCredentials} tone="green" />
          <StatCard label="Credentials Presented" value={stats.credentialsPresented} tone="teal" />
          <StatCard label="Verification Activity" value={stats.verificationActivity} />
        </div>
      )}

      {!data ? (
        <Loading />
      ) : data.credentials.length === 0 ? (
        <EmptyState title="No credentials yet" subtitle="Your issued credentials will appear here." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.credentials.map((c) => (
            <button
              key={c.credentialId}
              onClick={() => setOpenCredentialId(c.credentialId)}
              className="card p-5 text-left hover:border-accent-teal/30 border border-transparent transition-colors relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-accent-teal/5" />
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-xs text-slate-500">{c.fields.institution}</p>
                  <p className="text-white font-semibold mt-1 leading-snug">{c.qualification}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-4 space-y-1 text-xs text-slate-500 relative">
                <p>Issued {new Date(c.issueDate).toLocaleDateString()}</p>
                <p className="mono">{c.credentialId}</p>
              </div>
              {c.status === "active" && (
                <span className="badge badge-green mt-3 relative">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green" /> Verified on-chain
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {openCredentialId && (
        <CredentialDetailModal
          credentialId={openCredentialId}
          onClose={() => setOpenCredentialId(null)}
        />
      )}
    </DashboardShell>
  );
}
