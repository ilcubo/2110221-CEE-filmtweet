import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // <-- (1) นำเข้า cookie-parser

// import routes
// import ItemRoute from "./routes/itemRoute.js";
// import MemberRoute from "./routes/memberRoute.js";
import MovieRoute from "./routes/movieRoute.js";
import AuthRoute from "./routes/authRoute.js"; // <-- (2) นำเข้า Auth Route

const app = express();

// Middleware: ใช้ cookie-parser ก่อน Body-parser
// ทำให้ Express สามารถอ่านและเขียน JWT token ในคุกกี้ได้
app.use(cookieParser()); // <-- (3) ใช้ cookie-parser

// body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// allow request from other origin (Frontend which is at different port)
app.use(cors());

// use routes
// app.use("/items", ItemRoute);
// app.use("/members", MemberRoute);
app.use("/movies", MovieRoute)

// ********************************************************
// 4. เพิ่ม Auth Route
// ผู้ใช้จะเข้าถึง Register/Login ได้ผ่าน URL เช่น /api/v1/auth/register
// ********************************************************
app.use("/api/v1/auth", AuthRoute); 

export default app;