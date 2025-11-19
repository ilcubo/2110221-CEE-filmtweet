import User from "../models/user.js";
import jwt from "jsonwebtoken";

// ****************************************************
// HELPER FUNCTION: สร้าง JWT Token
// ****************************************************
const signToken = (id) => {
    // ใช้ JWT_SECRET และ JWT_EXPIRES_IN จาก .env
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// ****************************************************
// 1. REGISTER (ลงทะเบียนผู้ใช้ใหม่)
// ****************************************************
export const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // สร้าง User ใหม่ (Password ถูก Hash โดย Mongoose Middleware)
        const newUser = await User.create({
            username,
            email,
            password, 
        });

        const token = signToken(newUser._id);

        // ตั้งค่า Cookie สำหรับ Authentication
        res.cookie('jwt', token, {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), // ใช้ค่าจาก .env (เช่น 90 วัน)
            httpOnly: true, // ป้องกันการเข้าถึงจาก Client-side script
            secure: process.env.NODE_ENV === 'production', // ใช้ HTTPS ใน Production
            sameSite: 'Lax' // ตั้งค่า SameSite
        });

        // ส่ง Response กลับไป
        res.status(201).json({
            status: "success",
            token, 
            data: {
                user: {
                    _id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                },
            },
        });
    } catch (err) {
        // จัดการ Error เช่น Email ซ้ำ หรือข้อมูลไม่ครบ
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

// ****************************************************
// 2. LOGIN (เข้าสู่ระบบ)
// ****************************************************
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. ตรวจสอบข้อมูลเข้า
        if (!email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "Please provide email and password!",
            });
        }

        // 2. ค้นหา User และดึงรหัสผ่านมาด้วย (+password)
        const user = await User.findOne({ email }).select('+password');

        // 3. ตรวจสอบการยืนยันตัวตน
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                status: "fail",
                message: "Incorrect email or password!",
            });
        }

        // 4. สร้าง JWT Token และตั้งค่า Cookie
        const token = signToken(user._id);

        res.cookie('jwt', token, {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax'
        });
        
        // 5. ส่ง Response กลับไป
        res.status(200).json({
            status: "success",
            token,
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                },
            },
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

// ****************************************************
// 3. LOGOUT (ออกจากระบบ)
// ****************************************************
export const logout = (req, res) => {
    // ลบคุกกี้ JWT โดยการตั้งค่าให้หมดอายุทันที
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000), // หมดอายุใน 10 วินาที
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
};