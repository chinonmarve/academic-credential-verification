import React, { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell.jsx";
import { Loading, ErrorBanner, StatusBadge, EmptyState } from "../../components/Common.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";
import { UNIVERSITY_NAV } from "./nav.js";

const EMPTY_FORM = { fullName: "", studentNumber: "", programme: "", department: "", faculty: "", email: "" };

export default function Students() {
  const { token } = useAuth();
  const [students, setStudents] = useState(null);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  function load() {
    api.getStudents(token).then((d) => setStudents(d.students)).catch((e) => setError(e.message));
  }

  useEffect(load, [token]);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.addStudent(token, form);
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const filtered = (students || []).filter((s) =>
    `${s.fullName} ${s.studentId} ${s.programme}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <DashboardShell navItems={UNIVERSITY_NAV} roleLabel="University Portal" pageTitle="Students">
      <ErrorBanner message={error} />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <input
          className="input max-w-xs"
          placeholder="Search students..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary">
          {showForm ? "Cancel" : "+ Add Student"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="card p-5 mb-6 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div>
            <label className="label">Student ID / Matric Number</label>
            <input className="input" required value={form.studentNumber} onChange={(e) => setForm({ ...form, studentNumber: e.target.value })} />
          </div>
          <div>
            <label className="label">Programme</label>
            <input className="input" required value={form.programme} onChange={(e) => setForm({ ...form, programme: e.target.value })} />
          </div>
          <div>
            <label className="label">Department</label>
            <input className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          </div>
          <div>
            <label className="label">Faculty</label>
            <input className="input" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} />
          </div>
          <div>
            <label className="label">Email (optional — creates wallet login)</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <button disabled={saving} className="btn-primary">{saving ? "Registering..." : "Register Student & Generate DID"}</button>
          </div>
        </form>
      )}

      {!students ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState title="No students found" subtitle="Register a student to get started." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500 border-b border-white/5">
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Programme</th>
                <th className="px-4 py-3">DID</th>
                <th className="px-4 py-3">Credentials</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Registered</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3 mono text-xs text-slate-400">{s.studentId}</td>
                  <td className="px-4 py-3 text-slate-200 font-medium">{s.fullName}</td>
                  <td className="px-4 py-3 text-slate-400">{s.department}</td>
                  <td className="px-4 py-3 text-slate-400">{s.programme}</td>
                  <td className="px-4 py-3 mono text-xs text-slate-500 max-w-[160px] truncate" title={s.did}>{s.did}</td>
                  <td className="px-4 py-3 text-slate-300">{s.credentialCount}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{new Date(s.dateRegistered).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  );
}
