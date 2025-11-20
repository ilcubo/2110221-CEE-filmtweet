import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import * as reviewController from "../controllers/reviewController.js"

const router = express.Router();


router.get("/tools/recalculate", reviewController.recalculateAllRatings);

router.get("/", reviewController.getReviews);
router.get("/:movie", reviewController.getReviews);
router.post("/", verifyToken, reviewController.createReview);
router.put("/:id", verifyToken, reviewController.updateReview);
router.delete("/:id", verifyToken, reviewController.deleteReview);

export default router;