import "dotenv/config";

export const config = {
  port: Number(process.env.PORT || 5000),
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3307),
    user: process.env.DB_USER || "ecommerce",
    password: process.env.DB_PASSWORD || "ecommerce",
    database: process.env.DB_NAME || "ecommerce"
  },
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379"
};
