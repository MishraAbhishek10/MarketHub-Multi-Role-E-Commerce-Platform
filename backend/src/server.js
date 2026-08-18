import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { initDb } from "./db.js";
import { connectRedis } from "./redis.js";
import { seed } from "./seed.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
import uploadRoutes from "./routes/upload.js";
import { notFound, errorHandler } from "./middleware/error.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const app = express();
app.use(cors({ origin: config.clientUrl }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(uploadDir));

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", service: "ecommerce-api" })
);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

async function start() {
  await initDb();
  await seed();
  await connectRedis();
  app.listen(config.port, () =>
    console.log(`Backend running at http://localhost:${config.port}`)
  );
}

start().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});
