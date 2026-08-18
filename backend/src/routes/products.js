import { Router } from "express";
import { pool } from "../db.js";
import { redis } from "../redis.js";
import { auth, allow } from "../middleware/auth.js";

const router = Router();
const cacheKey = (q, category, page, limit) =>
  `products:${q || ""}:${category || ""}:${page}:${limit}`;

async function clearProductCache() {
  if (!redis.isOpen) return;
  const keys = await redis.keys("products:*");
  if (keys.length) await redis.del(keys);
}

router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q || "");
    const category = String(req.query.category || "");
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 8)));
    const offset = (page - 1) * limit;
    const key = cacheKey(q, category, page, limit);

    if (redis.isOpen) {
      const cached = await redis.get(key);
      if (cached) return res.json(JSON.parse(cached));
    }

    const where = [];
    const params = [];
    if (q) {
      where.push("(p.name LIKE ? OR p.description LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }
    if (category) {
      where.push("p.category = ?");
      params.push(category);
    }
    const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [[count]] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p ${clause}`, params
    );

    const [rows] = await pool.query(
      `SELECT p.id,p.name,p.description,p.price,p.category,p.image_url,p.stock,
              p.seller_id,u.name AS seller_name
       FROM products p JOIN users u ON u.id=p.seller_id
       ${clause} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const result = { products: rows, total: count.total, page, limit,
      pages: Math.ceil(count.total / limit) };

    if (redis.isOpen) await redis.setEx(key, 60, JSON.stringify(result));
    res.json(result);
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*,u.name AS seller_name FROM products p
       JOIN users u ON u.id=p.seller_id WHERE p.id=?`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: "Product not found" });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.post("/", auth, allow("seller", "admin"), async (req, res, next) => {
  try {
    const { name, description, price, category, image_url, stock } = req.body;
    if (!name || price === undefined || !category) {
      return res.status(400).json({ message: "Name, price and category are required" });
    }
    const sellerId = req.user.role === "admin" && req.body.seller_id
      ? req.body.seller_id : req.user.id;

    const [result] = await pool.query(
      `INSERT INTO products (seller_id,name,description,price,category,image_url,stock)
       VALUES (?,?,?,?,?,?,?)`,
      [sellerId, name, description || "", Number(price), category,
       image_url || "", Number(stock || 0)]
    );
    await clearProductCache();
    res.status(201).json({ id: result.insertId, message: "Product created" });
  } catch (e) { next(e); }
});

router.put("/:id", auth, allow("seller", "admin"), async (req, res, next) => {
  try {
    const [found] = await pool.query("SELECT * FROM products WHERE id=?", [req.params.id]);
    if (!found.length) return res.status(404).json({ message: "Product not found" });
    if (req.user.role === "seller" && found[0].seller_id !== req.user.id) {
      return res.status(403).json({ message: "You can edit only your products" });
    }

    const p = req.body;
    await pool.query(
      `UPDATE products SET name=?,description=?,price=?,category=?,image_url=?,stock=?
       WHERE id=?`,
      [p.name, p.description || "", Number(p.price), p.category,
       p.image_url || "", Number(p.stock || 0), req.params.id]
    );
    await clearProductCache();
    res.json({ message: "Product updated" });
  } catch (e) { next(e); }
});

router.delete("/:id", auth, allow("seller", "admin"), async (req, res, next) => {
  try {
    const [found] = await pool.query("SELECT * FROM products WHERE id=?", [req.params.id]);
    if (!found.length) return res.status(404).json({ message: "Product not found" });
    if (req.user.role === "seller" && found[0].seller_id !== req.user.id) {
      return res.status(403).json({ message: "You can delete only your products" });
    }
    await pool.query("DELETE FROM products WHERE id=?", [req.params.id]);
    await clearProductCache();
    res.json({ message: "Product deleted" });
  } catch (e) { next(e); }
});

export default router;
