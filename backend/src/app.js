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

// Handle Private Network Access preflight from browsers (when a less-private origin
// tries to access a more-private address space like `localhost`). Modern browsers
// will send `Access-Control-Request-Private-Network: true` on preflight and expect
// `Access-Control-Allow-Private-Network: true` in the response.
app.use((req, res, next) => {
  if (req.method === "OPTIONS" && req.headers["access-control-request-private-network"]) {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
  }
  next();
});

// Handle all OPTIONS requests for CORS and PNA preflight
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      req.headers["access-control-request-headers"] || "Content-Type,Authorization"
    );
    if (req.headers["access-control-request-private-network"]) {
      res.setHeader("Access-Control-Allow-Private-Network", "true");
    }
    return res.sendStatus(204);
  }
  next();
});

// allow request from other origin (Frontend which is at different port)
app.use(cors());

// use routes
// app.use("/items", ItemRoute);
// app.use("/members", MemberRoute);
app.use("/movies", MovieRoute);
app.use("/login", LoginRoute);;
app.use("/reviews", ReviewRoute);

export default app;
