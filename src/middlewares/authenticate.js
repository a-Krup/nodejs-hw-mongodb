import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import User from "../models/User.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token from Authorization header:", token);
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
      console.log("Token from cookies:", token);
    }

    if (!token) {
      console.log("Access token is missing");
      throw createHttpError(401, "Access token is missing");
    }

    console.log("Token received:", token);
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("User not found for id:", decoded.userId);
      throw createHttpError(401, "User not found");
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.log("Access token expired");
      return next(createHttpError(401, "Access token expired"));
    }
    console.log("Invalid access token error:", err);
    return next(createHttpError(401, "Invalid access token"));
  }
};

export default authenticate;
