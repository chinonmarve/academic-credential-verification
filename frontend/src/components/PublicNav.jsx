import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const dashboardPathFor = (role) =>
  role === "university" ? "/university/dashboard" : role === "student" ? "/student/wallet" : "/employer/dashboard";

export default function PublicNav() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const linkCls = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? "text-accent-teal" : "text-slate-300 hover:text-white"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-navy-950/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#2DD4BF" strokeWidth="1.8" className="w-4.5 h-4.5">
              <path d="m9 12 2 2 4-4M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4Z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-bold text-white tracking-tight">ACV Platform</span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/" end className={linkCls}>Home</NavLink>
          <NavLink to="/about" className={linkCls}>About the System</NavLink>
          <NavLink to="/verify" className={linkCls}>Verify Credential</NavLink>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {token && user ? (
            <>
              <button onClick={() => navigate(dashboardPathFor(user.role))} className="btn-secondary !px-3 !py-2">
                Dashboard
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-sm text-slate-400 hover:text-accent-red px-2"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className="btn-primary !px-4 !py-2">
              Login to Dashboard
            </NavLink>
          )}
        </div>

        <button className="md:hidden text-slate-300" onClick={() => setOpen((o) => !o)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 px-4 py-4 space-y-3 bg-navy-950">
          <NavLink to="/" end className="block text-sm text-slate-300" onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/about" className="block text-sm text-slate-300" onClick={() => setOpen(false)}>About the System</NavLink>
          <NavLink to="/verify" className="block text-sm text-slate-300" onClick={() => setOpen(false)}>Verify Credential</NavLink>
          {token && user ? (
            <button onClick={() => { navigate(dashboardPathFor(user.role)); setOpen(false); }} className="btn-secondary w-full">
              Dashboard
            </button>
          ) : (
            <NavLink to="/login" className="btn-primary w-full block text-center" onClick={() => setOpen(false)}>
              Login to Dashboard
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}
