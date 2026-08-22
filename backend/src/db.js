import mysql from "mysql2/promise";

const useSSL = process.env.DB_SSL === "true";

const sslConfig = useSSL
  ? {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true
    }
  : false;

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USER || "ecommerce",
  password: process.env.DB_PASSWORD || "ecommerce",
  database: process.env.DB_NAME || "ecommerce",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: sslConfig
});

export async function initDb() {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
    console.log("MySQL/TiDB Connected ✅");
  } finally {
    connection.release();
  }
}

export default pool;
