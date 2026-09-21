import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("acv_token"));
  const [user, setUser] = useState(() => {
    const raw = sessionStorage.getItem("acv_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (token) sessionStorage.setItem("acv_token", token);
    else sessionStorage.removeItem("acv_token");
  }, [token]);

  useEffect(() => {
    if (user) sessionStorage.setItem("acv_user", JSON.stringify(user));
    else sessionStorage.removeItem("acv_user");
  }, [user]);

  async function login(email, password) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
