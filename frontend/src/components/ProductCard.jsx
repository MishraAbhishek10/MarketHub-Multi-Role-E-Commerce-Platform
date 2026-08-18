import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function ProductCard({ product, refresh }) {
  const { user } = useAuth();

  async function add() {
    if (!user) return alert("Please login first");
    if (user.role !== "buyer") return alert("Only buyers can add products to cart");
    try {
      await api.post("/cart/items", { productId: product.id, quantity: 1 });
      alert("Added to cart");
    } catch (e) {
      alert(e.response?.data?.message || "Could not add to cart");
    }
  }

  return (
    <article className="card">
      <img src={product.image_url || "https://via.placeholder.com/600x400?text=Product"} alt={product.name} />
      <div className="card-body">
        <span className="tag">{product.category}</span>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="card-footer">
          <strong>₹{Number(product.price).toLocaleString("en-IN")}</strong>
          <button className="primary" onClick={add} disabled={!product.stock}>
            {product.stock ? "Add to cart" : "Out of stock"}
          </button>
        </div>
      </div>
    </article>
  );
}
