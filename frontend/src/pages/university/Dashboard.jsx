import React, { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell.jsx";
import { StatCard, Loading, ErrorBanner } from "../../components/Common.jsx";
import { MonthlyBarChart, OutcomeDonut } from "../../components/Charts.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";
import { UNIVERSITY_NAV } from "./nav.js";

export default function UniversityDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.universityStats(token).then(setStats).catch((e) => setError(e.message));
  }, [token]);

  return (
    <DashboardShell navItems={UNIVERSITY_NAV} roleLabel="University Portal" pageTitle="Dashboard">
      <ErrorBanner message={error} />
      {!stats ? (
        <Loading />
      ) : (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Students" value={stats.totalStudents} />
            <StatCard label="Credentials Issued" value={stats.credentialsIssued} tone="teal" />
            <StatCard label="Active Credentials" value={stats.activeCredentials} tone="green" />
            <StatCard label="Revoked Credentials" value={stats.revokedCredentials} tone="red" />
            <StatCard label="Verification Requests" value={stats.verificationRequests} />
            <StatCard label="Successful Verifications" value={stats.successfulVerifications} tone="green" />
            <StatCard label="Failed Verifications" value={stats.failedVerifications} tone="red" />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <p className="text-white font-semibold text-sm mb-1">Credential Activity</p>
              <p className="text-xs text-slate-500 mb-2">Credentials issued over time</p>
              <MonthlyBarChart data={stats.credentialsByMonth} label="Issued" />
            </div>
            <div className="card p-5">
              <p className="text-white font-semibold text-sm mb-1">Verification Activity</p>
              <p className="text-xs text-slate-500 mb-2">Valid vs invalid vs revoked attempts</p>
              <OutcomeDonut data={stats.verificationsByOutcome} />
            </div>
          </div>

          <div className="card p-5 max-w-md">
            <p className="text-white font-semibold text-sm mb-1">Credential Status</p>
            <p className="text-xs text-slate-500 mb-2">Active vs revoked</p>
            <OutcomeDonut data={stats.credentialStatus} />
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
