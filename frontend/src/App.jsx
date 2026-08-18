import { Routes,Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

export default function App(){
  return <>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/cart" element={<ProtectedRoute roles={["buyer"]}><Cart/></ProtectedRoute>}/>
      <Route path="/orders" element={<ProtectedRoute roles={["buyer","seller","admin"]}><Orders/></ProtectedRoute>}/>
      <Route path="/seller" element={<ProtectedRoute roles={["seller"]}><SellerDashboard/></ProtectedRoute>}/>
      <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard/></ProtectedRoute>}/>
    </Routes>
  </>
}
