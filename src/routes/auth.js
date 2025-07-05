import express from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import {
  register,
  login,
  refreshSession,
  logout,
  sendResetEmail,
  resetPassword,
} from "../controllers/auth.js";
import authenticate from "../middlewares/authenticate.js";
import { validateBody } from "../middlewares/validateBody.js";
import Joi from "joi";

const router = express.Router();

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

router.post("/register", ctrlWrapper(register));
router.post("/login", ctrlWrapper(login));
router.post("/refresh", ctrlWrapper(refreshSession));
router.post("/logout", authenticate, ctrlWrapper(logout));

router.post("/send-reset-email", ctrlWrapper(sendResetEmail));
router.post(
  "/reset-pwd",
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPassword)
);

export default router;
