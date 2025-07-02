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
    if (error) {
      return res.status(400).json({
        status: 400,
        message: error.details[0].message,
        data: null,
      });
    }

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
    if (error) {
      return res.status(400).json({
        status: 400,
        message: error.details[0].message,
        data: null,
      });
    }

    const { email, password } = req.body;
    const {
      accessToken,
      refreshToken,
      accessTokenValidFor,
      refreshTokenValidFor,
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
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const refreshSession = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        status: 401,
        message: "Refresh token is missing",
        data: null,
      });
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
    const sessionId = req.user?.sessionId;

    if (!refreshToken || !sessionId) {
      return res.status(400).json({
        status: 400,
        message: "Missing sessionId or refreshToken",
        data: null,
      });
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