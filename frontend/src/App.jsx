import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/public/Home.jsx";
import About from "./pages/public/About.jsx";
import Login from "./pages/public/Login.jsx";
import VerifyPublic from "./pages/public/VerifyPublic.jsx";

import UniversityDashboard from "./pages/university/Dashboard.jsx";
import Students from "./pages/university/Students.jsx";
import Credentials from "./pages/university/Credentials.jsx";
import IssueCredential from "./pages/university/IssueCredential.jsx";
import Blockchain from "./pages/university/Blockchain.jsx";
import AuditLogs from "./pages/university/AuditLogs.jsx";

import Wallet from "./pages/student/Wallet.jsx";

import EmployerDashboard from "./pages/employer/EmployerDashboard.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify" element={<VerifyPublic />} />

      {/* University */}
      <Route path="/university/dashboard" element={<ProtectedRoute role="university"><UniversityDashboard /></ProtectedRoute>} />
      <Route path="/university/students" element={<ProtectedRoute role="university"><Students /></ProtectedRoute>} />
      <Route path="/university/credentials" element={<ProtectedRoute role="university"><Credentials /></ProtectedRoute>} />
      <Route path="/university/issue" element={<ProtectedRoute role="university"><IssueCredential /></ProtectedRoute>} />
      <Route path="/university/blockchain" element={<ProtectedRoute role="university"><Blockchain /></ProtectedRoute>} />
      <Route path="/university/audit-logs" element={<ProtectedRoute role="university"><AuditLogs /></ProtectedRoute>} />

      {/* Student */}
      <Route path="/student/wallet" element={<ProtectedRoute role="student"><Wallet /></ProtectedRoute>} />

      {/* Employer */}
      <Route path="/employer/dashboard" element={<ProtectedRoute role="employer"><EmployerDashboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
