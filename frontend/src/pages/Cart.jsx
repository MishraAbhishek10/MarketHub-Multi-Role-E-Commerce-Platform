import { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const [cart,setCart] = useState({items:[],total:0});
  const navigate = useNavigate();

  async function load(){ const {data}=await api.get("/cart"); setCart(data); }
  useEffect(()=>{load()},[]);

  async function update(id,quantity){
    await api.put(`/cart/items/${id}`,{quantity});
    load();
  }

  async function checkout(){
    try {
      const {data}=await api.post("/orders");
      alert(`Order #${data.orderId} placed successfully`);
      navigate("/orders");
    } catch(e){ alert(e.response?.data?.message || "Checkout failed"); }
  }

  return <main>
    <h1>Your Cart</h1>
    <div className="list">
      {cart.items.map(x=><div className="cart-item" key={x.product_id}>
        <img src={x.image_url} />
        <div><h3>{x.name}</h3><p>₹{Number(x.price).toLocaleString("en-IN")}</p></div>
        <input type="number" min="1" max={x.stock} value={x.quantity} onChange={e=>update(x.product_id,Number(e.target.value))}/>
        <button className="ghost" onClick={()=>update(x.product_id,0)}>Remove</button>
      </div>)}
      {!cart.items.length && <div className="empty">Your cart is empty.</div>}
    </div>
    {!!cart.items.length && <div className="checkout">
      <h2>Total: ₹{Number(cart.total).toLocaleString("en-IN")}</h2>
      <button className="primary" onClick={checkout}>Place Order</button>
    </div>}
  </main>;
}
