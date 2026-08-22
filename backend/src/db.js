// import mysql from "mysql2/promise";
// import { config } from "./config.js";

// export const pool = mysql.createPool({
//   host: config.db.host,
//   port: config.db.port,
//   user: config.db.user,
//   password: config.db.password,
//   database: config.db.database,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// export async function initDb() {
//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS users (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       name VARCHAR(100) NOT NULL,
//       email VARCHAR(255) NOT NULL UNIQUE,
//       password_hash VARCHAR(255) NOT NULL,
//       role ENUM('buyer','seller','admin') NOT NULL DEFAULT 'buyer',
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//     )
//   `);

//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS products (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       seller_id INT NOT NULL,
//       name VARCHAR(255) NOT NULL,
//       description TEXT,
//       price DECIMAL(10,2) NOT NULL,
//       category VARCHAR(100) NOT NULL,
//       image_url TEXT,
//       stock INT NOT NULL DEFAULT 0,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//       FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
//       INDEX idx_category (category),
//       INDEX idx_seller (seller_id)
//     )
//   `);

//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS carts (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       user_id INT NOT NULL UNIQUE,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
//     )
//   `);

//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS cart_items (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       cart_id INT NOT NULL,
//       product_id INT NOT NULL,
//       quantity INT NOT NULL,
//       UNIQUE KEY uq_cart_product (cart_id, product_id),
//       FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
//       FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
//     )
//   `);

//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS orders (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       user_id INT NOT NULL,
//       total_amount DECIMAL(10,2) NOT NULL,
//       status ENUM('PLACED','PROCESSING','SHIPPED','DELIVERED','CANCELLED') DEFAULT 'PLACED',
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
//     )
//   `);

//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS order_items (
//       id INT AUTO_INCREMENT PRIMARY KEY,
//       order_id INT NOT NULL,
//       product_id INT NOT NULL,
//       seller_id INT NOT NULL,
//       product_name VARCHAR(255) NOT NULL,
//       price DECIMAL(10,2) NOT NULL,
//       quantity INT NOT NULL,
//       FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
//     )
//   `);
// }
import mysql from 'mysql2/promise';

// Check if app is running on Render or connecting to remote host
const isProduction = process.env.NODE_ENV === 'production' || (process.env.DB_HOST && process.env.DB_HOST !== '127.0.0.1');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USER || 'ecommerce',
  password: process.env.DB_PASSWORD || 'ecommerce',
  database: process.env.DB_NAME || 'ecommerce',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // TiDB Cloud requires SSL/TLS
  ssl: isProduction ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : false
});

export async function initDb() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
    console.log('MySQL/TiDB Connected ✅');
  } finally {
    connection.release();
  }
}

export default pool;
