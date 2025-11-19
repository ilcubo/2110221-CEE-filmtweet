// reviewRoute.js (Corrected name and code)

import express from "express";
import {verifyToken} from "../middleware/authMiddleware.js";

import * as reviewController from "../controllers/reviewController.js"

const router = express.Router();

// GET /reviews -> return all reviews (optional filtering via query params)
router.get("/", reviewController.getReviews);
// GET /reviews/:title -> return reviews for a specific movie (via route params)
router.get("/:title", reviewController.getReviews);
// POST /reviews -> create a new review (requires authentication)
router.post("/", verifyToken, reviewController.createReview);

router.delete("/:id", verifyToken, reviewController.deleteReview); // :id is the Review's _id

export default router;