import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // process.env.MONGO_URL ถูกโหลดมาจากไฟล์ .env ผ่าน dotenv/config ใน server.js
        const connection = await mongoose.connect(process.env.MONGO_URL);

        console.log(`✅ MongoDB Connected Successfully! Host: ${connection.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error.message);
        // หากเชื่อมต่อไม่ได้ ให้ปิดแอปพลิเคชัน
        process.exit(1);
    }
};

export default connectDB;