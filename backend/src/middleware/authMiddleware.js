import { promisify } from "util";
import jwt from "jsonwebtoken";
import User from "../models/user.js"; // <-- ต้องเป็นชื่อไฟล์ Model ที่ถูกต้อง (user.js)

// Middleware สำหรับตรวจสอบการเข้าสู่ระบบ
export const protect = async (req, res, next) => {
    try {
        let token;
        
        // 1) รับ Token จาก Request
        // ตรวจสอบ Token ใน Cookie ก่อน (Token ถูกตั้งไว้ตอน Login/Register)
        if (req.cookies.jwt) {
            token = req.cookies.jwt;
        } 
        // หากไม่มีใน Cookie ก็ตรวจสอบใน Authorization Header (Bearer Token)
        else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        // 2) ตรวจสอบว่ามี Token หรือไม่
        if (!token) {
            return res.status(401).json({
                status: "fail",
                message: "You are not logged in! Please log in to get access.",
            });
        }

        // 3) ตรวจสอบความถูกต้องของ Token (Verification)
        // JWT_SECRET ต้องตรงกับที่ใช้สร้าง
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        
        // 4) ตรวจสอบว่า User ที่มี ID นี้ยังคงอยู่ในระบบหรือไม่
        // Note: ถ้า User ถูกลบไปจาก DB Token นี้จะใช้ไม่ได้
        const currentUser = await User.findById(decoded.id);

        if (!currentUser) {
            return res.status(401).json({
                status: "fail",
                message: "The user belonging to this token no longer exists.",
            });
        }

        // 5) หากทุกอย่างถูกต้อง, บันทึกข้อมูลผู้ใช้ไว้ใน Request Object
        // ทำให้ Controller Function สามารถเข้าถึงข้อมูลผู้ใช้ได้ผ่าน req.user
        req.user = currentUser;
        next(); // อนุญาตให้ไปต่อที่ Controller Function
    } catch (err) {
        // จัดการ Error เช่น Token หมดอายุ (Expired) หรือ Invalid Signature
        console.error("Authentication Error:", err.message);
        return res.status(401).json({
            status: "fail",
            message: "Invalid or expired token.",
        });
    }
};