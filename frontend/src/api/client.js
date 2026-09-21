const BASE = "/api";

async function request(path, { method = "GET", body, token, headers = {} } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  me: (token) => request("/auth/me", { token }),

  // University
  getStudents: (token) => request("/university/students", { token }),
  addStudent: (token, payload) => request("/university/students", { method: "POST", body: payload, token }),
  getStudentDetail: (token, id) => request(`/university/students/${id}`, { token }),
  getIssuedCredentials: (token) => request("/university/credentials", { token }),
  issueCredential: (token, payload) =>
    request("/university/credentials/issue", { method: "POST", body: payload, token }),
  revokeCredential: (token, credentialId, reason) =>
    request(`/university/credentials/${credentialId}/revoke`, { method: "POST", body: { reason }, token }),
  universityStats: (token) => request("/university/dashboard/stats", { token }),
  universityBlockchain: (token) => request("/university/blockchain", { token }),
  universityAuditLogs: (token) => request("/university/audit-logs", { token }),

  // Student
  getWallet: (token) => request("/student/wallet", { token }),
  getWalletCredential: (token, id) => request(`/student/wallet/${id}`, { token }),
  presentCredential: (token, id, disclosedAttributes) =>
    request(`/student/wallet/${id}/present`, { method: "POST", body: { disclosedAttributes }, token }),
  studentStats: (token) => request("/student/dashboard/stats", { token }),

  // Verification (public + employer)
  verifyCredential: (payload, token) => request("/verify", { method: "POST", body: payload, token }),
  verificationHistory: (token) => request("/verify/history", { token }),
  employerStats: (token) => request("/verify/dashboard/stats", { token })
};
