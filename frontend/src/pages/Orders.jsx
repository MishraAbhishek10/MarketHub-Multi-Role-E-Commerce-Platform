import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Orders(){
  const {user}=useAuth(); const [orders,setOrders]=useState([]);
  async function load(){const {data}=await api.get("/orders");setOrders(data);}
  useEffect(()=>{load()},[]);
  async function status(id,status){
    await api.patch(`/orders/${id}/status`,{status}); load();
  }
  return <main><h1>{user.role==="buyer"?"My Orders":"Orders"}</h1>
    <div className="orders">{orders.map(o=><div className="order" key={o.id}>
      <div><strong>Order #{o.id}</strong><span>{new Date(o.created_at).toLocaleString()}</span></div>
      {o.buyer_name && <p>Buyer: {o.buyer_name}</p>}
      <p>Total: ₹{Number(o.total_amount).toLocaleString("en-IN")}</p>
      <span className="status">{o.status}</span>
      {user.role!=="buyer" && <select value={o.status} onChange={e=>status(o.id,e.target.value)}>
        {["PLACED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"].map(s=><option key={s}>{s}</option>)}
      </select>}
    </div>)}</div>
  </main>
}
