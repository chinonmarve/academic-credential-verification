import React from "react";

export function StatCard({ label, value, hint, tone = "slate" }) {
  const toneClasses = {
    slate: "text-white",
    green: "text-accent-green",
    red: "text-accent-red",
    teal: "text-accent-teal",
    amber: "text-accent-amber"
  };
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-2 ${toneClasses[tone]}`}>{value}</p>
      {hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    active: { cls: "badge-green", label: "Active" },
    valid: { cls: "badge-green", label: "Valid" },
    VALID: { cls: "badge-green", label: "Valid" },
    revoked: { cls: "badge-red", label: "Revoked" },
    REVOKED: { cls: "badge-red", label: "Revoked" },
    invalid: { cls: "badge-red", label: "Invalid" },
    INVALID: { cls: "badge-red", label: "Invalid" },
    pending: { cls: "badge-amber", label: "Pending" }
  };
  const entry = map[status] || { cls: "badge-slate", label: status };
  return <span className={`badge ${entry.cls}`}>{entry.label}</span>;
}

export function StepTimeline({ steps }) {
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
              s.passed ? "bg-accent-green/15 text-accent-green border border-accent-green/40" : "bg-accent-red/15 text-accent-red border border-accent-red/40"
            }`}
          >
            {s.passed ? "✓" : "✕"}
          </span>
          <div>
            <p className="text-sm text-slate-200 font-medium">{s.step}</p>
            {s.status && <p className="text-xs text-slate-500">Status: {s.status}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="card p-10 text-center">
      <p className="text-slate-300 font-medium">{title}</p>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}

export function Loading({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-slate-400 text-sm py-8 justify-center">
      <span className="w-3 h-3 rounded-full border-2 border-accent-teal border-t-transparent animate-spin" />
      {label}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-accent-red/30 bg-accent-red/10 text-accent-red text-sm px-3 py-2.5 mb-4">
      {message}
    </div>
  );
}
