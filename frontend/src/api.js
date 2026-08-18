import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function saveAuth(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
