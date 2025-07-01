import createHttpError from "http-errors";
import Joi from "joi";
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
} from "../services/auth.js";

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const isProd = process.env.NODE_ENV === "production";

export const register = async (req, res, next) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) throw createHttpError(400, error.details[0].message);

    const { name, email, password } = req.body;
    const user = await registerUser({ name, email, password });

    res.status(201).json({
      status: 201,
      message: "Successfully registered a user!",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) throw createHttpError(400, error.details[0].message);

    const { email, password } = req.body;
    const {
      accessToken,
      refreshToken,
      accessTokenValidFor,
      refreshTokenValidFor,
      sessionId,
    } = await loginUser(email, password);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Strict",
      maxAge: accessTokenValidFor,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Strict",
      maxAge: refreshTokenValidFor,
    });

    res.status(200).json({
      status: 200,
      message: "Successfully logged in a user!",
      data: { accessToken, sessionId },
    });
  } catch (err) {
    next(err);
  }
};

export const refreshSession = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw createHttpError(401, "Refresh token is missing");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await refreshUserSession(refreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    });

    res.status(200).json({
      status: 200,
      message: "Successfully refreshed a session!",
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const sessionId = req.body?.sessionId;

    if (!refreshToken || !sessionId) {
      throw createHttpError(400, "Missing sessionId or refreshToken");
    }

    await logoutUser(sessionId, refreshToken);

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Strict",
    });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};