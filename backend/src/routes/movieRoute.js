import express from "express";
import { protect } from "../middleware/authMiddleware.js"; // <-- นำเข้า Middleware
import * as movieController from "../controllers/movieController.js"

const router = express.Router();

router.get("/", movieController.getMovies);
router.get("/:category/:tags", movieController.filterMovies);

router.post("/", protect, movieController.createMovie);

export default router;