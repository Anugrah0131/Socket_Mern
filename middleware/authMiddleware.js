import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Standalone function for socket and other use cases
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "default_secret");
  } catch (error) {
    return null;
  }
};

// Express Middleware
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }

    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    next();
  } catch (error) {
    console.error("Token Verification Error:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};