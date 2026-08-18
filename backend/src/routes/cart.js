import { Router } from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = Router();

async function ensureCart(userId) {
  await pool.query("INSERT IGNORE INTO carts (user_id) VALUES (?)", [userId]);
  const [rows] = await pool.query("SELECT id FROM carts WHERE user_id=?", [userId]);
  return rows[0].id;
}

router.get("/", auth, async (req, res, next) => {
  try {
    const cartId = await ensureCart(req.user.id);
    const [items] = await pool.query(
      `SELECT ci.product_id,ci.quantity,p.name,p.price,p.image_url,p.stock
       FROM cart_items ci JOIN products p ON p.id=ci.product_id WHERE ci.cart_id=?`,
      [cartId]
    );
    const total = items.reduce((s, x) => s + Number(x.price) * x.quantity, 0);
    res.json({ items, total });
  } catch (e) { next(e); }
});

router.post("/items", auth, async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const cartId = await ensureCart(req.user.id);
    const [p] = await pool.query("SELECT id,stock FROM products WHERE id=?", [productId]);
    if (!p.length) return res.status(404).json({ message: "Product not found" });
    if (quantity < 1 || quantity > p[0].stock) {
      return res.status(400).json({ message: "Invalid quantity or insufficient stock" });
    }
    await pool.query(
      `INSERT INTO cart_items (cart_id,product_id,quantity) VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE quantity=quantity+VALUES(quantity)`,
      [cartId, productId, quantity]
    );
    res.status(201).json({ message: "Added to cart" });
  } catch (e) { next(e); }
});

router.put("/items/:productId", auth, async (req, res, next) => {
  try {
    const cartId = await ensureCart(req.user.id);
    const quantity = Number(req.body.quantity);
    if (quantity <= 0) {
      await pool.query("DELETE FROM cart_items WHERE cart_id=? AND product_id=?", [cartId, req.params.productId]);
    } else {
      await pool.query(
        "UPDATE cart_items SET quantity=? WHERE cart_id=? AND product_id=?",
        [quantity, cartId, req.params.productId]
      );
    }
    res.json({ message: "Cart updated" });
  } catch (e) { next(e); }
});

router.delete("/items/:productId", auth, async (req, res, next) => {
  try {
    const cartId = await ensureCart(req.user.id);
    await pool.query("DELETE FROM cart_items WHERE cart_id=? AND product_id=?", [cartId, req.params.productId]);
    res.json({ message: "Removed from cart" });
  } catch (e) { next(e); }
});

export default router;
