import express from "express";
import {
  userLogin,
  userSignup,
  userUpdate,
  getUsers,
  userLogout,
  getCurrentUser,
} from "../controllers/user.controller.js";

import { authMiddleware } from "../middlewares/user.middleware.js";

const router = express.Router();

router.post("/signup", userSignup);
router.post("/login", userLogin);
router.put("/update", authMiddleware, userUpdate);
router.get("/bulk", authMiddleware, getUsers);
router.post("/logout", authMiddleware, userLogout);
router.get("/me", authMiddleware, getCurrentUser);

export default router;
