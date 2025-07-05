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

export const findUserByEmail = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(404, "User not found");
  }
  return user;
};

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

export const loginUser = async (email, password) => {
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

  await Session.deleteMany({ userId: user._id });

  const sessionTemp = new Session({
    userId: user._id,
    accessToken: "temp",
    refreshToken: "temp",
    accessTokenValidUntil: new Date(Date.now() + accessTokenValidFor),
    refreshTokenValidUntil: new Date(Date.now() + refreshTokenValidFor),
  });
  await sessionTemp.validate();

  const sessionId = sessionTemp._id.toString();

  const accessToken = jwt.sign(
    { userId: user._id, sessionId },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user._id, sessionId },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "30d" }
  );

  sessionTemp.accessToken = accessToken;
  sessionTemp.refreshToken = refreshToken;

  await sessionTemp.save();

  return {
    accessToken,
    refreshToken,
    accessTokenValidFor,
    refreshTokenValidFor,
    sessionId,
  };
};

export const refreshUserSession = async (refreshToken) => {
  try {
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const { userId, sessionId } = payload;

    const session = await Session.findOne({
      userId,
      _id: sessionId,
      refreshToken,
    });
    if (!session) {
      throw createHttpError(401, "Session not found or expired");
    }

    if (new Date() > session.refreshTokenValidUntil) {
      throw createHttpError(401, "Refresh token expired");
    }

    const accessTokenValidFor = 15 * 60 * 1000;
    const refreshTokenValidFor = 30 * 24 * 60 * 60 * 1000;

    const newAccessToken = jwt.sign(
      { userId, sessionId },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { userId, sessionId },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "30d" }
    );

    session.accessToken = newAccessToken;
    session.refreshToken = newRefreshToken;
    session.accessTokenValidUntil = new Date(Date.now() + accessTokenValidFor);
    session.refreshTokenValidUntil = new Date(
      Date.now() + refreshTokenValidFor
    );

    await session.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      throw createHttpError(401, "Invalid refresh token");
    }
    throw err;
  }
};

export const logoutUser = async (id, refreshToken = null) => {
  // Якщо передали sessionId — видаляємо конкретну сесію
  if (refreshToken) {
    const session = await Session.findOne({ _id: id, refreshToken });
    if (!session) {
      throw createHttpError(404, "Session not found");
    }
    await Session.deleteOne({ _id: id });
  } else {
    // Інакше — видаляємо всі сесії для користувача
    await Session.deleteMany({ userId: id });
  }
};

// ✅ НОВА ФУНКЦІЯ для оновлення пароля
export const updateUserPassword = async (userId, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashedPassword });
};