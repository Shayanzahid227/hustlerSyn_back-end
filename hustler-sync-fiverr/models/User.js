const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { required } = require("zod/mini");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
  },
  phone: String,
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["client", "hustler"],
    default: "client",
  },
  profileImage: {
    type: String,
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  language: {
    type: String,
    default: "English",
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HustlerService",
    },
  ],
  activeSubscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    required: false,
    default: null,
  },
  subscriptionHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
