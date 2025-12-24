const mongoose = require("mongoose");

const JobPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 3,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    serviceCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },
    location: {
      type: String,
      required: true,
      minlength: 3,
    },
    languages: [
      {
        type: String,
        required: true,
        trim: true,
      },
    ],
    images: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed", "in-progress"],
      default: "open",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JobPost", JobPostSchema);
