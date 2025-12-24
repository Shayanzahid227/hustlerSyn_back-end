const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { error } = require("../helpers/response");

const verifyJWT = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return error(res, "Access denied. No token provided.", 401);
    }
    //
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.isDeleted) {
      return error(res, "User not found or account deactivated.", 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return error(res, "Invalid or expired token.", 401);
  }
};

const verifyClient = async (req, res, next) => {
  try {
    if (req.user.role !== "client") {
      return error(res, "Access denied. Client privileges required.", 403);
    }
    next();
  } catch (err) {
    return error(res, "Authorization failed.", 403);
  }
};

const verifyHustler = async (req, res, next) => {
  try {
    if (req.user.role !== "hustler" && req.user.role !== "client") {
      return error(res, "Access denied. Hustler privileges required.", 403);
    }
    next();
  } catch (err) {
    return error(res, "Authorization failed.", 403);
  }
};

module.exports = { verifyJWT, verifyClient, verifyHustler };
