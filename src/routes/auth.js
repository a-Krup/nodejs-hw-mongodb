import express from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import {
  register,
  login,
  refreshSession,
  logout,
  sendResetEmail, 
} from "../controllers/auth.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

// Маршрути для реєстрації, логіну, скиду паролю та іншого
router.post("/register", ctrlWrapper(register));
router.post("/login", ctrlWrapper(login));
router.post("/refresh", ctrlWrapper(refreshSession));
router.post("/logout", authenticate, ctrlWrapper(logout));

// Маршрут для скиду паролю
router.post("/send-reset-email", ctrlWrapper(sendResetEmail));

export default router;