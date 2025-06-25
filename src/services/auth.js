import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import User from "../models/User.js";
import Session from "../models/Session.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw createHttpError(401, "Invalid email or password");
  }

  const accessTokenValidFor = 15 * 60 * 1000; // 15 хв
  const refreshTokenValidFor = 30 * 24 * 60 * 60 * 1000; // 30 днів

  const accessToken = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });

  // Видаляємо стару сесію (якщо є)
  await Session.deleteMany({ userId: user._id });

  // Створюємо нову сесію
  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + accessTokenValidFor),
    refreshTokenValidUntil: new Date(Date.now() + refreshTokenValidFor),
  });

  return { accessToken, refreshToken };
};