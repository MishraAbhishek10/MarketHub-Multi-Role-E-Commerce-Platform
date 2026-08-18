import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const empty={name:"",description:"",price:"",category:"Electronics",image_url:"",stock:""};

export default function SellerDashboard(){
  const {user}=useAuth();
  const [products,setProducts]=useState([]);
  const [orders,setOrders]=useState([]);
  const [form,setForm]=useState(empty);
  const [editing,setEditing]=useState(null);
  const [image,setImage]=useState(null);

  async function load(){
    const [{data:p},{data:o}] = await Promise.all([
      api.get("/products",{params:{limit:50}}),
      api.get("/orders")
    ]);
    setProducts(p.products.filter(x=>x.seller_id===user.id));
    setOrders(o);
  }
  useEffect(()=>{load()},[]);

  async function uploadImage(){
    if(!image) return form.image_url;
    const fd=new FormData();
    fd.append("image",image);
    const {data}=await api.post("/upload",fd,{headers:{"Content-Type":"multipart/form-data"}});
    return data.url;
  }

  async function save(e){
    e.preventDefault();
    try{
      const image_url=await uploadImage();
      const payload={...form,image_url};
      if(editing) await api.put(`/products/${editing}`,payload);
      else await api.post("/products",payload);
      setForm(empty);setImage(null);setEditing(null);load();
    }catch(e){alert(e.response?.data?.message||"Could not save product");}
  }

  async function del(id){
    if(confirm("Delete this product?")){await api.delete(`/products/${id}`);load();}
  }

  return <main>
    <div className="dashboard-header">
      <div><span className="eyebrow dark">SELLER PORTAL</span><h1>Welcome, {user.name}</h1><p className="muted">Manage your catalog and orders.</p></div>
      <div className="seller-kpi"><b>{products.length}</b><span>Active products</span></div>
    </div>

    <div className="dashboard-grid">
      <form className="form-card" onSubmit={save}>
        <h2>{editing?"Edit product":"Add product"}</h2>
        <input required placeholder="Product name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <textarea placeholder="Description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
        <input required type="number" min="0" placeholder="Price" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Electronics</option><option>Fashion</option><option>Accessories</option></select>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setImage(e.target.files[0])}/>
        <input placeholder="Or image URL" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})}/>
        <input required type="number" min="0" placeholder="Stock" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})}/>
        <button className="primary wide">{editing?"Update":"Publish"} product</button>
        {editing && <button type="button" className="ghost wide" onClick={()=>{setEditing(null);setForm(empty);setImage(null)}}>Cancel</button>}
      </form>

      <section>
        <h2>My Products</h2>
        {products.map(p=><div className="manage" key={p.id}>
          <div className="manage-product">
            <img src={p.image_url?.startsWith("/") ? `http://localhost:5000${p.image_url}` : p.image_url}/>
            <div><strong>{p.name}</strong><small>₹{Number(p.price).toLocaleString("en-IN")} · Stock {p.stock}</small></div>
          </div>
          <div className="manage-actions">
            <button className="ghost" onClick={()=>{setEditing(p.id);setForm({...p,price:String(p.price),stock:String(p.stock)})}}>Edit</button>
            <button className="danger" onClick={()=>del(p.id)}>Delete</button>
          </div>
        </div>)}

        <h2 className="section-title">Recent Orders</h2>
        {orders.slice(0,8).map(o=><div className="order" key={o.id}>
          <div><strong>Order #{o.id}</strong><small>{o.buyer_name}</small></div>
          <span className="status">{o.status}</span>
          <strong>₹{Number(o.total_amount).toLocaleString("en-IN")}</strong>
        </div>)}
      </section>
    </div>
  </main>
}
