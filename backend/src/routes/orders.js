import { Router } from "express";
import { pool } from "../db.js";
import { auth, allow } from "../middleware/auth.js";

const router = Router();

router.post("/", auth, allow("buyer"), async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [carts] = await conn.query("SELECT id FROM carts WHERE user_id=?", [req.user.id]);
    if (!carts.length) return res.status(400).json({ message: "Cart is empty" });

    const [items] = await conn.query(
      `SELECT ci.product_id,ci.quantity,p.name,p.price,p.stock,p.seller_id
       FROM cart_items ci JOIN products p ON p.id=ci.product_id WHERE ci.cart_id=?`,
      [carts[0].id]
    );
    if (!items.length) return res.status(400).json({ message: "Cart is empty" });

    for (const item of items) {
      if (item.quantity > item.stock) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
    }

    const total = items.reduce((s, x) => s + Number(x.price) * x.quantity, 0);
    const [order] = await conn.query(
      "INSERT INTO orders (user_id,total_amount) VALUES (?,?)", [req.user.id, total]
    );

    for (const item of items) {
      await conn.query(
        `INSERT INTO order_items
         (order_id,product_id,seller_id,product_name,price,quantity)
         VALUES (?,?,?,?,?,?)`,
        [order.insertId,item.product_id,item.seller_id,item.name,item.price,item.quantity]
      );
      await conn.query(
        "UPDATE products SET stock=stock-? WHERE id=?",
        [item.quantity,item.product_id]
      );
    }

    await conn.query("DELETE FROM cart_items WHERE cart_id=?", [carts[0].id]);
    await conn.commit();
    res.status(201).json({ orderId: order.insertId, total });
  } catch (e) {
    await conn.rollback();
    next(e);
  } finally {
    conn.release();
  }
});

router.get("/", auth, async (req, res, next) => {
  try {
    let rows;
    if (req.user.role === "admin") {
      [rows] = await pool.query(
        `SELECT o.*,u.name AS buyer_name,u.email FROM orders o
         JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC`
      );
    } else if (req.user.role === "seller") {
      [rows] = await pool.query(
        `SELECT DISTINCT o.id,o.user_id,o.total_amount,o.status,o.created_at,
                u.name AS buyer_name
         FROM orders o JOIN users u ON u.id=o.user_id
         JOIN order_items oi ON oi.order_id=o.id
         WHERE oi.seller_id=? ORDER BY o.created_at DESC`, [req.user.id]
      );
    } else {
      [rows] = await pool.query(
        "SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC", [req.user.id]
      );
    }
    res.json(rows);
  } catch (e) { next(e); }
});

router.get("/:id", auth, async (req, res, next) => {
  try {
    const [orders] = await pool.query("SELECT * FROM orders WHERE id=?", [req.params.id]);
    if (!orders.length) return res.status(404).json({ message: "Order not found" });
    const order = orders[0];

    if (req.user.role === "buyer" && order.user_id !== req.user.id)
      return res.status(403).json({ message: "Access denied" });

    const [items] = await pool.query("SELECT * FROM order_items WHERE order_id=?", [req.params.id]);
    res.json({ ...order, items });
  } catch (e) { next(e); }
});

router.patch("/:id/status", auth, allow("admin","seller"), async (req, res, next) => {
  try {
    const allowed = ["PLACED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid status" });
    if (req.user.role === "seller") {
      const [ok] = await pool.query(
        "SELECT id FROM order_items WHERE order_id=? AND seller_id=? LIMIT 1",
        [req.params.id, req.user.id]
      );
      if (!ok.length) return res.status(403).json({ message: "Access denied" });
    }
    await pool.query("UPDATE orders SET status=? WHERE id=?", [req.body.status, req.params.id]);
    res.json({ message: "Order status updated" });
  } catch (e) { next(e); }
});

export default router;
