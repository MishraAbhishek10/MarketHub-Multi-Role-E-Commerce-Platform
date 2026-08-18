import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const empty={name:"",description:"",price:"",category:"Electronics",image_url:"",stock:""};

export default function Dashboard(){
  const {user}=useAuth(); const [stats,setStats]=useState(null); const [products,setProducts]=useState([]);
  const [form,setForm]=useState(empty); const [editing,setEditing]=useState(null);

  async function load(){
    if(user.role==="admin"){const {data}=await api.get("/admin/stats");setStats(data);}
    const {data}=await api.get("/products",{params:{limit:50}});
    setProducts(data.products);
  }
  useEffect(()=>{load()},[]);

  async function save(e){
    e.preventDefault();
    try{
      if(editing) await api.put(`/products/${editing}`,form);
      else await api.post("/products",form);
      setForm(empty);setEditing(null);load();
    }catch(e){alert(e.response?.data?.message||"Could not save");}
  }
  async function del(id){
    if(confirm("Delete this product?")){await api.delete(`/products/${id}`);load();}
  }

  return <main>
    <h1>{user.role==="admin"?"Admin Dashboard":"Seller Dashboard"}</h1>
    {stats && <div className="stats">
      <div><b>{stats.users}</b><span>Users</span></div>
      <div><b>{stats.products}</b><span>Products</span></div>
      <div><b>{stats.orders}</b><span>Orders</span></div>
      <div><b>₹{stats.revenue.toLocaleString("en-IN")}</b><span>Revenue</span></div>
    </div>}

    <div className="dashboard-grid">
      <form className="form-card" onSubmit={save}>
        <h2>{editing?"Edit product":"Add product"}</h2>
        <input required placeholder="Product name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <input required type="number" min="0" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Electronics</option><option>Fashion</option><option>Accessories</option></select>
        <input placeholder="Image URL" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})}/>
        <input required type="number" min="0" placeholder="Stock" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/>
        <button className="primary wide">{editing?"Update":"Create"} product</button>
        {editing && <button type="button" className="ghost wide" onClick={()=>{setEditing(null);setForm(empty)}}>Cancel</button>}
      </form>

      <div><h2>Products</h2>{products.map(p=><div className="manage" key={p.id}>
        <div><strong>{p.name}</strong><small>₹{Number(p.price).toLocaleString("en-IN")} · {p.category} · Stock {p.stock}</small></div>
        {(user.role==="admin" || p.seller_id===user.id) && <>
          <button className="ghost" onClick={()=>{setEditing(p.id);setForm({...p,price:String(p.price),stock:String(p.stock)})}}>Edit</button>
          <button className="danger" onClick={()=>del(p.id)}>Delete</button>
        </>}
      </div>)}</div>
    </div>
  </main>
}
