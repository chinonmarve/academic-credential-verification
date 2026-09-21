import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ICONS = {
  dashboard: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z",
  students: "M12 2 2 7l10 5 10-5-10-5Zm0 8L2 15l10 5 10-5-10-5Z",
  credentials: "M4 4h16v4H4V4Zm0 6h16v10H4V10Zm4 3h4v2H8v-2Z",
  issue: "M12 5v14M5 12h14",
  blockchain: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z",
  audit: "M4 4h16v16H4V4Zm4 4h8M8 12h8M8 16h5",
  wallet: "M3 7h18v12H3V7Zm0-2 4-2h10l4 2M15 12h4",
  verify: "m9 12 2 2 4-4M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7l8-4Z",
  settings: "M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7ZM19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7.3 7.3 0 0 0-2.1-1.2L14 3h-4l-.4 2.6a7.3 7.3 0 0 0-2.1 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1c.6.5 1.3.9 2.1 1.2L10 21h4l.4-2.6c.8-.3 1.5-.7 2.1-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
};

function Icon({ path, className = "w-5 h-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className}>
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function DashboardShell({ navItems, roleLabel, children, pageTitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-accent-teal/10 border border-accent-teal/30 flex items-center justify-center">
            <Icon path={ICONS.verify} className="w-4.5 h-4.5 text-accent-teal" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-white leading-none">ACV Platform</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{roleLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent-teal/10 text-accent-teal border border-accent-teal/20"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent"
              }`
            }
            onClick={() => setDrawerOpen(false)}
          >
            <Icon path={ICONS[item.icon] || ICONS.dashboard} className="w-4.5 h-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-2 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-xs font-semibold text-slate-200">
            {(user?.name || "?").slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-accent-red hover:bg-accent-red/5">
          <Icon path={ICONS.logout} className="w-4.5 h-4.5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy-950 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 border-r border-white/5 bg-navy-900">{SidebarContent}</aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-navy-900 border-r border-white/5">{SidebarContent}</aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-white/5 bg-navy-900/60 backdrop-blur flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-slate-300" onClick={() => setDrawerOpen(true)}>
              <Icon path="M4 6h16M4 12h16M4 18h16" className="w-6 h-6" />
            </button>
            <h1 className="text-base lg:text-lg font-semibold text-white">{pageTitle}</h1>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span className="badge badge-slate">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              Network: Simulated Ethereum-Compatible
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
