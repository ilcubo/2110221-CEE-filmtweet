import express from "express";
import {verifyToken} from "../middleware/authMiddleware.js";

import * as reviewController from "../controllers/reviewController.js"

const router = express.Router();

router.get("/:movie", reviewController.getReviews);
router.post("/", verifyToken, reviewController.createReview);

export default router;