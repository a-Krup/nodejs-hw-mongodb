import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import User from "../models/User.js";
import Session from "../models/Session.js";
import dotenv from "dotenv";
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError(409, "Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  return newUser;
};

export const loginUser = async (email, password, res) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(401, "Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw createHttpError(401, "Invalid email or password");
  }

  const accessTokenValidFor = 15 * 60 * 1000;
  const refreshTokenValidFor = 30 * 24 * 60 * 60 * 1000;

  const accessToken = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: "30d",
  });

  await Session.deleteMany({ userId: user._id });

  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + accessTokenValidFor),
    refreshTokenValidUntil: new Date(Date.now() + refreshTokenValidFor),
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: accessTokenValidFor,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: refreshTokenValidFor,
  });

  res.json({ message: "User logged in successfully" });
};

export const refreshUserSession = async (refreshToken) => {
  try {
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const userId = payload.userId;

    const session = await Session.findOne({ userId, refreshToken });

    if (!session) {
      throw createHttpError(401, "Session not found or expired");
    }

    if (new Date() > session.refreshTokenValidUntil) {
      throw createHttpError(401, "Refresh token expired");
    }

    await Session.deleteMany({ userId });

    const accessTokenValidFor = 15 * 60 * 1000;
    const refreshTokenValidFor = 30 * 24 * 60 * 60 * 1000;

    const newAccessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    const newRefreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
      expiresIn: "30d",
    });

    await Session.create({
      userId,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenValidUntil: new Date(Date.now() + accessTokenValidFor),
      refreshTokenValidUntil: new Date(Date.now() + refreshTokenValidFor),
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      throw createHttpError(401, "Invalid refresh token");
    }
    throw err;
  }
};

export const logoutUser = async (sessionId, refreshToken) => {
  const session = await Session.findOne({ _id: sessionId, refreshToken });

  if (!session) {
    throw createHttpError(404, "Session not found");
  }

  await Session.deleteOne({ _id: sessionId });
};
