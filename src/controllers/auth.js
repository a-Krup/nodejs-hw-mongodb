import Joi from "joi";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import httpErrors from "http-errors";
import {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  findUserByEmail,
  updateUserPassword,
} from "../services/auth.js";

const isProd = process.env.NODE_ENV === "production";

// Схеми валідації
const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const sendResetEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});

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

    const {
      accessToken,
      refreshToken: newRefreshToken,
      refreshTokenValidFor,
    } = await refreshUserSession(refreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Strict",
      maxAge: refreshTokenValidFor,
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

export const sendResetEmail = async (req, res, next) => {
  try {
    const { error } = sendResetEmailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 400,
        message: error.details[0].message,
        data: null,
      });
    }

    const { email } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return next(httpErrors(404, "User not found!"));
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });

    const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.verify();

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: "Password Reset Request",
      text: `Click the following link to reset your password: ${resetLink}`,
      html: `<p>Click the following link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      status: 200,
      message: "Reset password email has been successfully sent.",
      data: {},
    });
  } catch (err) {
    next(httpErrors(500, `Failed to send the email. Detailed error: ${err.message}`));
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

   let decoded;
try {
  decoded = jwt.verify(token, process.env.JWT_SECRET);
} catch {
  return next(httpErrors(401, "Token is expired or invalid."));
}

    const user = await findUserByEmail(decoded.email);
    if (!user) {
      return next(httpErrors(404, "User not found!"));
    }

    await updateUserPassword(user._id, password);
    await logoutUser(user.sessionId);

    res.status(200).json({
      status: 200,
      message: "Password has been successfully reset.",
      data: {},
    });
  } catch (err) {
    console.error(err); 
    next(err);
  }
};