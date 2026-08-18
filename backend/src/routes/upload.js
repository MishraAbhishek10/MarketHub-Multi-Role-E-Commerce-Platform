import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { auth, allow } from "../middleware/auth.js";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve("uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG and WEBP images are allowed"));
    }
    cb(null, true);
  }
});

router.post("/", auth, allow("seller", "admin"), upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Image is required" });
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

export default router;
