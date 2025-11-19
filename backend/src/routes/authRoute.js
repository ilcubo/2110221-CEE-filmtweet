import express from "express";
import { register, login, logout } from "../controllers/authController.js";

const router = express.Router();

// Route สำหรับการลงทะเบียน (Register)
// Method: POST /api/v1/auth/register
router.post("/register", register);

// Route สำหรับการเข้าสู่ระบบ (Login)
// Method: POST /api/v1/auth/login
router.post("/login", login);

// Route สำหรับการออกจากระบบ (Logout)
// Method: GET /api/v1/auth/logout
router.get("/logout", logout);

export default router;