import React, { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell.jsx";
import { Loading, ErrorBanner, EmptyState } from "../../components/Common.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";
import { UNIVERSITY_NAV } from "./nav.js";

export default function Blockchain() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.universityBlockchain(token).then(setData).catch((e) => setError(e.message));
  }, [token]);

  return (
    <DashboardShell navItems={UNIVERSITY_NAV} roleLabel="University Portal" pageTitle="Blockchain Records">
      <ErrorBanner message={error} />
      {!data ? (
        <Loading />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span className="badge badge-slate">Network: {data.network}</span>
            <span className={`badge ${data.integrity.valid ? "badge-green" : "badge-red"}`}>
              Chain Integrity: {data.integrity.valid ? "Verified" : "Broken"}
            </span>
          </div>

          {data.records.length === 0 ? (
            <EmptyState title="No blockchain records yet" subtitle="Issue a credential to see it anchored here." />
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10 hidden sm:block" />
              <div className="space-y-4">
                {data.records.map((r) => (
                  <div key={r.id} className="relative sm:pl-10">
                    <span className="hidden sm:flex absolute left-2.5 top-4 w-3 h-3 rounded-full bg-accent-teal border-2 border-navy-950" />
                    <div className="card p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="badge badge-slate">Block #{r.blockNumber}</span>
                        <span className={`badge ${r.eventType === "REVOCATION" ? "badge-red" : "badge-green"}`}>{r.eventType}</span>
                        <span className="text-xs text-slate-500">{new Date(r.timestamp).toLocaleString()}</span>
                      </div>
                      <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        <Row label="Credential ID" value={r.credentialId} />
                        <Row label="Status" value={r.status} />
                        <Row label="Hash" value={r.credentialHash} full />
                        <Row label="Transaction" value={r.transactionHash} full />
                        <Row label="Block Hash" value={r.blockHash} full />
                        <Row label="Prev Block Hash" value={r.prevBlockHash} full />
                      </dl>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}

function Row({ label, value, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mono text-slate-300 break-all">{value}</dd>
    </div>
  );
}
