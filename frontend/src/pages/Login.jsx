import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const requestedRole = new URLSearchParams(location.search).get("role") || "buyer";

  const [role, setRole] = useState(requestedRole);
  const [email, setEmail] = useState(
    requestedRole === "admin" ? "admin@example.com" :
    requestedRole === "seller" ? "seller@example.com" : "buyer@example.com"
  );
  const [password, setPassword] = useState("Password@123");
  const [error, setError] = useState("");

  function switchRole(next) {
    setRole(next);
    setEmail(next === "admin" ? "admin@example.com" :
      next === "seller" ? "seller@example.com" : "buyer@example.com");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      const saved = JSON.parse(localStorage.getItem("user"));
      navigate(saved.role === "admin" ? "/admin" : saved.role === "seller" ? "/seller" : "/");
    } catch (e) {
      setError(e.response?.data?.message || "Login failed");
    }
  }

  return (
    <main className="auth-page">
      <form className="form-card auth-card" onSubmit={submit}>
        <div className="auth-logo">ShopSphere</div>
        <h2>{role === "admin" ? "Admin Portal" : role === "seller" ? "Seller Portal" : "Buyer Login"}</h2>
        <p className="muted">Choose the interface you want to access.</p>

        <div className="role-tabs">
          {["buyer","seller","admin"].map(r =>
            <button type="button" key={r}
              className={role === r ? "role-tab active" : "role-tab"}
              onClick={() => switchRole(r)}>
              {r[0].toUpperCase() + r.slice(1)}
            </button>
          )}
        </div>

        {error && <div className="error">{error}</div>}

        <label>Email
          <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
        </label>
        <label>Password
          <input type="password" required value={password} onChange={e=>setPassword(e.target.value)} />
        </label>

        <button className="primary wide">Login as {role}</button>

        {role !== "admin" && (
          <p className="center">New here? <Link className="link" to="/register">Create an account</Link></p>
        )}
        <small>Demo password: Password@123</small>
      </form>
    </main>
  );
}
