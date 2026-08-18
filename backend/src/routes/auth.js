import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { config } from "../config.js";
import { auth } from "../middleware/auth.js";

const router = Router();

function sign(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: "7d" }
  );
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role = "buyer" } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (!["buyer", "seller"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length) return res.status(409).json({ message: "Email already registered" });

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      "INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)",
      [name, email.toLowerCase(), hash, role]
    );

    const user = { id: result.insertId, name, email: email.toLowerCase(), role };
    res.status(201).json({ token: sign(user), user });
  } catch (e) { next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email?.toLowerCase()]);
    if (!rows.length || !(await bcrypt.compare(password || "", rows[0].password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const { id, name, role } = rows[0];
    const user = { id, name, email: rows[0].email, role };
    res.json({ token: sign(user), user });
  } catch (e) { next(e); }
});

router.get("/me", auth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id,name,email,role,created_at FROM users WHERE id=?",
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (e) { next(e); }
});

export default router;
