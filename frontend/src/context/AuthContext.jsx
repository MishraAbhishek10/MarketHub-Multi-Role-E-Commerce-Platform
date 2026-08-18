import { createContext, useContext, useState } from "react";
import { api, saveAuth, logout as clearAuth } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    saveAuth(data);
    setUser(data.user);
  }

  async function register(payload) {
    const { data } = await api.post("/auth/register", payload);
    saveAuth(data);
    setUser(data.user);
  }

  function logout() {
    clearAuth();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>
    {children}
  </AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
