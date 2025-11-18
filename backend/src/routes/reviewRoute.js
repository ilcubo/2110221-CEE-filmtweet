import express from "express";

import * as reviewController from "../controllers/reviewController.js"

const router = express.Router();

router.get("/:movie", reviewController.getReviews);

export default router;