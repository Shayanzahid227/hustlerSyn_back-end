const { error, success } = require("../../helpers/response");
const ServiceCategory = require("../../models/ServiceCategory");
const SubscriptionPlan = require("../../models/SubscriptionPlan");

const addHustlerService = async (req, res) => {
  try {
    const { name, description } = req.body;
    const serviceCheck = await ServiceCategory.findOne({ name, isDeleted: false });
    if (serviceCheck) {
      return error(res, "Service name already exists", 400);
    }
    const service = await ServiceCategory.create({
      name,
      description,
    });
    return success(res, "Service added successfully", service);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getAllHustlerServices = async (req, res) => {
  try {
    const services = await ServiceCategory.find({ isDeleted: false });
    return success(res, "Services fetched successfully", services);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getHustlerServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await ServiceCategory.findById(id);
    return success(res, "Service fetched successfully", service);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const addSubscriptionPlan = async (req, res) => {
  try {
    const { name, billingType, price, offerPrice, currency, offerText, features, planFor } = req.body;
    // check if name exists
    const planCheck = await SubscriptionPlan.findOne({ name, isDeleted: false });
    if (planCheck) {
      return error(res, "Subscription plan name already exists", 400);
    }
    const createdPlan = await SubscriptionPlan.create({
      name,
      billingType,
      price,
      offerPrice,
      currency: currency.toUpperCase(),
      offerText,
      planFor,
      features,
    });
    return success(res, "Subscription plan created successfully", createdPlan);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getAllHustlerSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isDeleted: false, planFor: "hustler" });
    return success(res, "Subscription plans fetched successfully", plans);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getAllClientSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isDeleted: false, planFor: "client" });
    return success(res, "Subscription plans fetched successfully", plans);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

const getSubscriptionPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await SubscriptionPlan.findById(id);
    if (!plan || plan.isDeleted) {
      return error(res, "Subscription plan not found", 404);
    }
    return success(res, "Subscription plan fetched successfully", plan);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

module.exports = {
  addHustlerService,
  getAllHustlerServices,
  getHustlerServiceById,
  addSubscriptionPlan,
  getAllHustlerSubscriptionPlans,
  getAllClientSubscriptionPlans,
  getSubscriptionPlanById,
};
