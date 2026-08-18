import { useEffect, useState } from "react";
import { api } from "../api";

export default function AdminDashboard(){
  const [stats,setStats]=useState(null);
  const [users,setUsers]=useState([]);
  const [orders,setOrders]=useState([]);
  const [products,setProducts]=useState([]);

  async function load(){
    const [{data:s},{data:u},{data:o},{data:p}] = await Promise.all([
      api.get("/admin/stats"),api.get("/admin/users"),api.get("/orders"),
      api.get("/products",{params:{limit:100}})
    ]);
    setStats(s);setUsers(u);setOrders(o);setProducts(p.products);
  }
  useEffect(()=>{load()},[]);

  async function removeUser(id){
    if(confirm("Delete this user and their related data?")){
      await api.delete(`/admin/users/${id}`);load();
    }
  }
  async function removeProduct(id){
    if(confirm("Delete this product?")){
      await api.delete(`/products/${id}`);load();
    }
  }

  if(!stats) return <main><p>Loading admin console...</p></main>;

  return <main>
    <div className="dashboard-header">
      <div><span className="eyebrow dark">ADMIN CONSOLE</span><h1>Platform Overview</h1><p className="muted">Control users, products and orders from one place.</p></div>
    </div>

    <div className="stats">
      <div><b>{stats.users}</b><span>Total users</span></div>
      <div><b>{stats.sellers}</b><span>Sellers</span></div>
      <div><b>{stats.products}</b><span>Products</span></div>
      <div><b>{stats.orders}</b><span>Orders</span></div>
      <div><b>₹{stats.revenue.toLocaleString("en-IN")}</b><span>Revenue</span></div>
    </div>

    <section className="admin-section">
      <h2>Users</h2>
      <div className="admin-table">
        <div className="table-head"><b>Name</b><b>Email</b><b>Role</b><b>Action</b></div>
        {users.map(u=><div className="table-row" key={u.id}>
          <span>{u.name}</span><span>{u.email}</span><span className="tag">{u.role}</span>
          <button className="danger" onClick={()=>removeUser(u.id)}>Delete</button>
        </div>)}
      </div>
    </section>

    <section className="admin-section">
      <h2>Products</h2>
      <div className="admin-table">
        <div className="table-head"><b>Product</b><b>Seller</b><b>Stock</b><b>Action</b></div>
        {products.map(p=><div className="table-row" key={p.id}>
          <span>{p.name}</span><span>{p.seller_name}</span><span>{p.stock}</span>
          <button className="danger" onClick={()=>removeProduct(p.id)}>Delete</button>
        </div>)}
      </div>
    </section>

    <section className="admin-section">
      <h2>Recent Orders</h2>
      {orders.slice(0,10).map(o=><div className="order" key={o.id}>
        <div><strong>Order #{o.id}</strong><small>{o.buyer_name}</small></div>
        <span className="status">{o.status}</span>
        <strong>₹{Number(o.total_amount).toLocaleString("en-IN")}</strong>
      </div>)}
    </section>
  </main>
}
