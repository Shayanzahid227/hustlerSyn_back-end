const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Plan name is required"],
  },
  billingType: {
    type: String,
    enum: ["monthly", "annual"],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  offerPrice: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "USD",
    uppercase: true,
  },
  offerText: {
    type: String,
    required: false,
  },
  planFor: {
    type: String,
    enum: ["client", "hustler"],
    required: true,
  },
  features: [
    {
      feature: String,
      enabled: { type: Boolean, default: true },
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

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
