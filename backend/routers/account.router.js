import express from "express";
import { getBalance, transfer } from "../controllers/account.controller.js";
import { authMiddleware } from "../middlewares/user.middleware.js";

const router = express.Router();

router.get("/balance", authMiddleware, getBalance);
router.post("/transfer", authMiddleware, transfer);

export default router;
