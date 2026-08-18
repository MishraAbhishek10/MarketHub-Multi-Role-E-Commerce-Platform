import { Router } from "express";
import { pool } from "../db.js";
import { auth, allow } from "../middleware/auth.js";

const router = Router();

router.get("/stats", auth, allow("admin"), async (req, res, next) => {
  try {
    const [[users]] = await pool.query("SELECT COUNT(*) AS count FROM users");
    const [[sellers]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role='seller'");
    const [[buyers]] = await pool.query("SELECT COUNT(*) AS count FROM users WHERE role='buyer'");
    const [[products]] = await pool.query("SELECT COUNT(*) AS count FROM products");
    const [[orders]] = await pool.query("SELECT COUNT(*) AS count FROM orders");
    const [[revenue]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount),0) AS amount FROM orders WHERE status <> 'CANCELLED'"
    );
    res.json({
      users: users.count,
      sellers: sellers.count,
      buyers: buyers.count,
      products: products.count,
      orders: orders.count,
      revenue: Number(revenue.amount)
    });
  } catch (e) { next(e); }
});

router.get("/users", auth, allow("admin"), async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id,name,email,role,created_at FROM users ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (e) { next(e); }
});

router.delete("/users/:id", auth, allow("admin"), async (req, res, next) => {
  try {
    if (Number(req.params.id) === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }
    await pool.query("DELETE FROM users WHERE id=?", [req.params.id]);
    res.json({ message: "User deleted" });
  } catch (e) { next(e); }
});

export default router;
