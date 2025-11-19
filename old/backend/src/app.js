import express from "express";
import cors from "cors";
import * as jose from "jose";

// import ItemRoute from "./routes/itemRoute.js";
// import MemberRoute from "./routes/memberRoute.js";
import MovieRoute from "./routes/movieRoute.js";
import LoginRoute from "./routes/loginRoute.js"
import ReviewRoute from "./routes/reviewRoute.js";

const app = express();

// body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// allow request from other origin (Frontend which is at different port)
app.use(cors());

// use routes
// app.use("/items", ItemRoute);
// app.use("/members", MemberRoute);
app.use("/movies", MovieRoute);
app.use("/login", LoginRoute);;
app.use("/reviews", ReviewRoute);

export default app;
