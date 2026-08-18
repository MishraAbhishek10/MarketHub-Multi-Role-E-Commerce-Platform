import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form,setForm] = useState({name:"",email:"",password:"",role:"buyer"});
  const [error,setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      await register(form);
      const u = JSON.parse(localStorage.getItem("user"));
      navigate(u.role === "seller" ? "/seller" : "/");
    } catch (e) {
      setError(e.response?.data?.message || "Registration failed");
    }
  }

  return (
    <main className="auth-page">
      <form className="form-card auth-card" onSubmit={submit}>
        <div className="auth-logo">ShopSphere</div>
        <h2>Create your account</h2>
        {error && <div className="error">{error}</div>}
        <input placeholder="Full name" required value={form.name}
          onChange={e=>setForm({...form,name:e.target.value})}/>
        <input placeholder="Email" type="email" required value={form.email}
          onChange={e=>setForm({...form,email:e.target.value})}/>
        <input placeholder="Password" type="password" required minLength="6" value={form.password}
          onChange={e=>setForm({...form,password:e.target.value})}/>
        <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
          <option value="buyer">Buyer account</option>
          <option value="seller">Seller account</option>
        </select>
        <button className="primary wide">Create account</button>
      </form>
    </main>
  );
}
