const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../../models/User");
const { success, error } = require("../../helpers/response");
const nodemailer = require("nodemailer");
const HustlerService = require("../../models/HustlerService");
const ServiceCategory = require("../../models/ServiceCategory");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT, // or 465 for SSL
      secure: true, // true for port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error("Email sending error:", err);
  }
};

const registerHustler = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      role,
      language,
      serviceCategoryId,
      startingPrice,
      businessName,
      businessDesc,
    } = req.body;
    const userExists = await User.findOne({ email, isDeleted: false });
    if (userExists) {
      return error(res, "User with this email already exists", 400);
    }
    const serviceCategory = await ServiceCategory.findOne({
      _id: serviceCategoryId,
      isDeleted: false,
    });
    if (!serviceCategory) {
      return error(res, "Service category not found", 404);
    }

    let image = null;
    if (req.files?.image) {
      image = req.files?.image.path;
    }

    let images = [];
    if (req.files.businessImages && req.files.businessImages.length > 0) {
      images = req.files.businessImages.map((file) => file.path);
    }

    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      role,
      language,
      profileImage: image,
    });

    const hustlerService = await HustlerService.create({
      userId: user._id,
      name: businessName,
      description: businessDesc,
      serviceCategoryId,
      startingPrice,
      images,
    });

    // Added hustler service to user
    user.services.push(hustlerService._id);

    await user.save();
    await hustlerService.save();

    const token = generateToken(user._id);
    return success(res, "Hustler registered successfully", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const registerClient = async (req, res) => {
  try {
    const { fullName, email, password, role, language } = req.body;
    const userExists = await User.findOne({ email, isDeleted: false });
    if (userExists) {
      return error(res, "Client with this email already exists", 400);
    }

    let image = null;
    if (req.file) {
      image = req.file.path;
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role,
      language,
      profileImage: image,
    });
    const token = generateToken(user._id);
    return success(res, "Client registered successfully", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
      return error(res, "Invalid email or password", 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return error(res, "Invalid email or password", 401);
    }

    const token = generateToken(user._id);

    return success(res, "Login successful", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, isDeleted: false });
    if (!user) {
      return error(res, "User with this email does not exist", 404);
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click this link to reset your password: ${resetUrl}`;

    await sendEmail(user.email, "Password Reset Request", message);

    return success(res, "Password reset link sent to email");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
      isDeleted: false,
    });

    if (!user) {
      return error(res, "Invalid or expired token", 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return success(res, "Password reset successful");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user || user.isDeleted) {
      return error(res, "User not found", 404);
    }
    return success(res, "Profile fetched successfully", user);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = {
  registerHustler,
  registerClient,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
};
