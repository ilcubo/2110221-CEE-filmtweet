import express from "express";

import * as movieController from "../controllers/movieController.js"

const router = express.Router();

router.get("/", movieController.getMovies);

export default router;