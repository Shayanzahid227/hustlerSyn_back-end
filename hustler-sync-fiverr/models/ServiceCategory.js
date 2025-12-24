const mongoose = require("mongoose");

const serviceCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Service category name is required"],
    unique: true,
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

const ServiceCategory = mongoose.model("ServiceCategory", serviceCategorySchema);

module.exports = ServiceCategory;
