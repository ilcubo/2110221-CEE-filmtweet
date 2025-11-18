import express from "express";

import * as loginController from "../controllers/loginController.js";

const router = express.Router();

router.post("/register", loginController.registerHandler);
router.post("/", loginController.loginHandler);

export default router;