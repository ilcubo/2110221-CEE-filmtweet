// backend/src/server.js

import "dotenv/config"; // 1. โหลดค่าจาก .env
import connectDB from "./config/db.js"; // 2. นำเข้าฟังก์ชันเชื่อมต่อ DB

import app from "./app.js";

// Global Error Handlers (ยังคงไว้ตามเดิม)
process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    console.log(err.stack);
    process.exit(1);
});

const PORT = process.env.PORT || 3222; // ดึง PORT จาก .env หรือใช้ค่าเริ่มต้น

// **********************************
// 3. เริ่มกระบวนการเชื่อมต่อและรัน Server
// **********************************
connectDB().then(() => {
    // เมื่อเชื่อมต่อ DB สำเร็จ (connectDB().then) ค่อยรัน Server
    const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`Backend Server ready at http://localhost:${PORT}`);
    });

    // นำตัวแปร server มาใช้ใน unhandledRejection
    process.on("unhandledRejection", (err) => {
        console.log("UNHANDLED REJECTION! 💥 Shutting down...");
        console.log(`${err}`);
        server.close(() => {
            process.exit(1);
        });
    });
}).catch(err => {
    // หากเกิดข้อผิดพลาดในการเรียก connectDB
    console.log("Failed to start server due to DB connection setup error.");
    process.exit(1);
});