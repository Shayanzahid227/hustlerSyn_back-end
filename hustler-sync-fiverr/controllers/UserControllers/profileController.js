const User = require("../../models/User");
const { success, error } = require("../../helpers/response");
const bcrypt = require("bcryptjs");

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

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user._id);
    if (!user || user.isDeleted) {
      return error(res, "User not found", 404);
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };

    await user.save();

    return success(res, "Profile updated successfully", {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user || user.isDeleted) {
      return error(res, "User not found", 404);
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return error(res, "Current password is incorrect", 400);
    }

    user.password = newPassword;
    await user.save();

    return success(res, "Password changed successfully");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const changePhone = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await User.findById(req.user._id);
    if (!user || user.isDeleted) {
      return error(res, "User not found", 404);
    }

    user.phone = phone;
    await user.save();

    return success(res, "Phone number changed successfully", { phone: user.phone });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  changePhone,
};
