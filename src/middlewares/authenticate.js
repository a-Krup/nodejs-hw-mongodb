import jwt from "jsonwebtoken";
import User from "../models/User.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        status: 401,
        message: "Access token is missing",
        data: null,
      });
    }

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "User not found",
        data: null,
      });
    }

    req.user = {
      _id: user._id,
      email: user.email,
      name: user.name,
      sessionId: decoded.sessionId, 
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: 401,
        message: "Access token expired",
        data: null,
      });
    }

    return res.status(401).json({
      status: 401,
      message: "Invalid access token",
      data: null,
    });
  }
};

export default authenticate;
