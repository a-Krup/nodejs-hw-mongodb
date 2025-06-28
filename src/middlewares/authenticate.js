import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import User from "../models/User.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw createHttpError(401, "Access token is missing");
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw createHttpError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(createHttpError(401, "Access token expired"));
    }
    return next(createHttpError(401, "Invalid access token"));
  }
};

export default authenticate;
