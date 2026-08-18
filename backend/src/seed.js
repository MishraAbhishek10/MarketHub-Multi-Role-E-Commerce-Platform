import bcrypt from "bcryptjs";
import { pool } from "./db.js";

export async function seed() {
  const password = await bcrypt.hash("Password@123", 12);

  const users = [
    ["Admin User","admin@example.com",password,"admin"],
    ["Demo Seller","seller@example.com",password,"seller"],
    ["Demo Buyer","buyer@example.com",password,"buyer"]
  ];

  for (const u of users) {
    await pool.query(
      "INSERT IGNORE INTO users (name,email,password_hash,role) VALUES (?,?,?,?)", u
    );
  }

  const [[seller]] = await pool.query("SELECT id FROM users WHERE email='seller@example.com'");
  const [[count]] = await pool.query("SELECT COUNT(*) AS count FROM products");

  if (count.count === 0) {
    const products = [
      ["Mechanical Keyboard","Hot-swappable mechanical keyboard",3499,"Electronics","https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=900",20],
      ["Wireless Headphones","Noise-isolating wireless headphones",4999,"Electronics","https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900",15],
      ["Running Shoes","Comfortable everyday running shoes",2999,"Fashion","https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900",30],
      ["Laptop Backpack","Water-resistant laptop backpack",1899,"Accessories","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900",25]
    ];
    for (const p of products) {
      await pool.query(
        `INSERT INTO products
         (seller_id,name,description,price,category,image_url,stock)
         VALUES (?,?,?,?,?,?,?)`, [seller.id, ...p]
      );
    }
  }
}
