// backend/src/models/User.model.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // สำหรับเข้ารหัสรหัสผ่าน

// กำหนดโครงสร้างข้อมูลผู้ใช้
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Please provide a username"],
            unique: true, // ห้ามซ้ำ
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true, // ห้ามซ้ำ
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Please provide a password"],
            minlength: 6,
            select: false, // สำคัญ: เมื่อ Query ข้อมูลผู้ใช้ จะไม่ดึงรหัสผ่านมาด้วย
        },
    },
    {
        timestamps: true, // เพิ่มฟิลด์ createdAt และ updatedAt
    }
);

// Middleware: เข้ารหัสรหัสผ่านก่อนบันทึก (Hashing Password)
// 'pre' hook จะทำงานก่อนการบันทึก (save) ข้อมูล
userSchema.pre("save", async function (next) {
    // รันเฉพาะเมื่อรหัสผ่านมีการแก้ไขหรือถูกสร้างขึ้นใหม่
    if (!this.isModified("password")) return next();

    // สร้าง Salt และ Hash รหัสผ่าน
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // ตั้งค่ารหัสผ่านยืนยันให้เป็น undefined (ถ้าคุณมีฟิลด์ confirmPassword)
    // this.confirmPassword = undefined; 
    next();
});

// Method: สร้างฟังก์ชันสำหรับเปรียบเทียบรหัสผ่าน (ใช้ตอน Login)
userSchema.methods.comparePassword = async function (candidatePassword) {
    // เปรียบเทียบรหัสผ่านที่ส่งมา (candidatePassword) กับรหัสผ่านที่ถูก Hash ใน DB (this.password)
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;