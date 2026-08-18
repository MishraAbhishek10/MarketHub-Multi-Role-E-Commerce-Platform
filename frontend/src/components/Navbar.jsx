import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function dashboard() {
    navigate(user.role === "admin" ? "/admin" : "/seller");
  }

  return (
    <nav className="nav">
      <Link className="brand" to={user?.role === "buyer" || !user ? "/" : user.role === "admin" ? "/admin" : "/seller"}>
        ShopSphere
      </Link>

      <div className="navlinks">
        {(!user || user.role === "buyer") && <Link to="/">Shop</Link>}
        {user?.role === "buyer" && <Link to="/cart">Cart</Link>}
        {user?.role === "buyer" && <Link to="/orders">My Orders</Link>}
        {user?.role === "seller" && <Link to="/seller">Seller Dashboard</Link>}
        {user?.role === "seller" && <Link to="/orders">Orders</Link>}
        {user?.role === "admin" && <Link to="/admin">Admin Dashboard</Link>}

        {user ? (
          <>
            <span className="user-pill">{user.name} · {user.role}</span>
            <button className="ghost" onClick={() => { logout(); navigate("/"); }}>Logout</button>
          </>
        ) : (
          <Link className="primary small" to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
