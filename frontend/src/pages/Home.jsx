import { useEffect, useState } from "react";
import { api } from "../api";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [data, setData] = useState({ products: [], pages: 0 });
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);

  async function load() {
    const { data } = await api.get("/products", { params: { q, category, page, limit: 8 } });
    setData(data);
  }

  useEffect(() => { load(); }, [q, category, page]);

  return (
    <main>
      <section className="hero">
        <div>
          <span className="eyebrow">FULL STACK E-COMMERCE</span>
          <h1>Everything you need.<br /><span>One simple shop.</span></h1>
          <p>Explore products, manage your cart and place orders in a production-style demo built with React, Node.js, MySQL and Redis.</p>
        </div>
      </section>

      <section className="toolbar">
        <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }} placeholder="Search products..." />
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All categories</option>
          <option>Electronics</option>
          <option>Fashion</option>
          <option>Accessories</option>
        </select>
      </section>

      <section className="grid">
        {data.products.map(p => <ProductCard key={p.id} product={p} />)}
      </section>

      <div className="pagination">
        <button className="ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {Math.max(1, data.pages)}</span>
        <button className="ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </main>
  );
}
