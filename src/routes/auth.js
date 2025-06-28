import express from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import {
  register,
  login,
  refreshSession,
  logout,
} from "../controllers/auth.js";

const router = express.Router();

router.post("/register", ctrlWrapper(register));
router.post("/login", ctrlWrapper(login));
router.post("/refresh", ctrlWrapper(refreshSession));
router.post("/logout", ctrlWrapper(logout));

export default router;
