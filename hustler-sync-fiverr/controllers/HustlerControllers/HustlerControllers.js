const { success, error } = require("../../helpers/response");
const HustlerService = require("../../models/HustlerService");
const Invoice = require("../../models/Invoice");
const JobPost = require("../../models/JobPost");
const ServiceCategory = require("../../models/ServiceCategory");
const User = require("../../models/User");
const { normalizeLanguages } = require("../../utils/normalizeLanguages");

const getAllHustlers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const hustlers = await User.find({ role: "hustler", isDeleted: false })
      .skip(skip)
      .limit(limit)
      .select("-password -subscriptionHistory -activeSubscriptionId -resetPasswordToken -resetPasswordExpire")
      .populate("services");

    return success(res, "Hustlers fetched successfully", hustlers);
  } catch (err) {
    return error(res, "Failed to fetch hustlers", 500);
  }
};

const getHustlerById = async (req, res) => {
  try {
    const hustlerId = req.params.id;
    const hustler = await User.findOne({ _id: hustlerId, role: "hustler", isDeleted: false })
      .select("-password -subscriptionHistory -activeSubscriptionId -resetPasswordToken -resetPasswordExpire")
      .populate("services");
    if (!hustler) {
      return error(res, "Hustler not found", 404);
    }
    return success(res, "Hustler fetched successfully", hustler);
  } catch (err) {
    return error(res, "Failed to fetch hustler", 500);
  }
};

const addHustlerServiceForHustler = async (req, res) => {
  try {
    const hustlerId = req.user._id;
    if (!hustlerId) {
      return error(res, "Unauthorized. Hustler ID missing.", 401);
    }

    const { name, description, startingPrice, serviceCategoryId } = req.body;

    const hustler = await User.findOne({ _id: hustlerId, isDeleted: false });
    if (!hustler) {
      return error(res, "Hustler not found", 404);
    }

    const serviceCategory = await ServiceCategory.findOne({
      _id: serviceCategoryId,
      isDeleted: false,
    });
    if (!serviceCategory) {
      return error(res, "Service category not found", 404);
    }

    let images = [];
    if (req.files.serviceImages && req.files.serviceImages.length > 0) {
      images = req.files.serviceImages.map((file) => file.path);
    }

    const hustlerService = await HustlerService.create({
      userId: hustlerId,
      name,
      description,
      serviceCategoryId,
      startingPrice,
      images,
    });

    hustler.services.push(hustlerService._id);

    await hustler.save();
    await hustlerService.save();

    return success(res, "Service added to hustler successfully", hustlerService);
  } catch (err) {
    return error(res, "Failed to add service to hustler", 500);
  }
};

const getSingleHustlerServiceForHustler = async (req, res) => {
  try {
    const hustlerId = req.user._id;
    const serviceId = req.params.id;
    if (!hustlerId) {
      return error(res, "Unauthorized. Hustler ID missing.", 401);
    }

    const hustlerService = await HustlerService.findOne({
      _id: serviceId,
      userId: hustlerId,
      isDeleted: false,
    })
      .populate("serviceCategoryId")
      .populate("userId", "-password");
    if (!hustlerService) {
      return error(res, "Hustler service not found", 404);
    }

    return success(res, "Hustler service fetched successfully", hustlerService);
  } catch (err) {
    return error(res, "Failed to fetch hustler service", 500);
  }
};

const getServiceProvidersByCategory = async (req, res) => {
  try {
    const serviceCategoryId = req.query.serviceCatId;
    const userId = req.user._id;

    if (!serviceCategoryId) {
      const hustlerServices = await HustlerService.find({
        userId: { $ne: userId },
        isDeleted: false,
      })
        .populate(
          "userId",
          "-password -subscriptionHistory -activeSubscriptionId -resetPasswordToken -resetPasswordExpire"
        )
        .populate("serviceCategoryId");
      return success(res, "Service providers fetched successfully", hustlerServices);
    }

    const serviceCategory = await ServiceCategory.findOne({
      _id: serviceCategoryId,
      isDeleted: false,
    });
    if (!serviceCategory) {
      return error(res, "Service category not found", 404);
    }

    const hustlerServices = await HustlerService.find({
      userId: { $ne: userId },
      serviceCategoryId,
      isDeleted: false,
    })
      .populate(
        "userId",
        "-password -subscriptionHistory -activeSubscriptionId -resetPasswordToken -resetPasswordExpire"
      )
      .populate("serviceCategoryId");

    return success(res, "Service providers fetched successfully", hustlerServices);
  } catch (err) {
    return error(res, "Failed to fetch service providers", 500);
  }
};

const hustlersSearchByServiceName = async (req, res) => {
  try {
    const { serviceName } = req.query;
    const userId = req.user._id;

    if (!serviceName) {
      return error(res, "Service name query parameter is required", 400);
    }

    const regex = new RegExp(serviceName, "i");

    const hustlerServices = await HustlerService.find({
      name: { $regex: regex },
      userId: { $ne: userId },
      isDeleted: false,
    })
      .populate(
        "userId",
        "-password -subscriptionHistory -activeSubscriptionId -resetPasswordToken -resetPasswordExpire"
      )
      .populate("serviceCategoryId");

    return success(res, "Hustler services fetched successfully", hustlerServices);
  } catch (err) {
    return error(res, "Failed to search hustler services", 500);
  }
};

const createHustlerFindingPost = async (req, res) => {
  try {
    const { title, description, budget, serviceCategoryId, languages, location } = req.body;

    const serviceCategory = await ServiceCategory.findOne({ _id: serviceCategoryId, isDeleted: false });
    if (!serviceCategory) {
      return error(res, "Service category not found", 404);
    }

    const normalizedLanguages = normalizeLanguages(languages);

    console.log("normalizedLanguages", normalizedLanguages);
    console.log("req.files.postImages", req.files.postImages);
    let images = [];
    if (req.files.postImages && req.files.postImages.length > 0) {
      images = req.files.postImages.map((file) => file.path);
    }

    const jobPost = await JobPost.create({
      title,
      description,
      budget,
      serviceCategoryId,
      languages: normalizedLanguages,
      location,
      images: images,
      createdBy: req.user._id,
    });

    return success(res, "Hustler finding post created successfully", jobPost);
  } catch (err) {
    console.log(err);
    return error(res, "Failed to create hustler finding post", 500);
  }
};

const getAllHustlerFindingPosts = async (req, res) => {
  try {
    const jobPosts = await JobPost.find({ createdBy: { $ne: req.user._id }, isDeleted: false })
      .populate("serviceCategoryId")
      .populate(
        "createdBy",
        "-password -subscriptionHistory -activeSubscriptionId -resetPasswordToken -resetPasswordExpire"
      );

    return success(res, "Hustler finding posts fetched successfully", jobPosts);
  } catch (err) {
    return error(res, "Failed to fetch hustler finding posts", 500);
  }
};

const getSingleHustlerFindingPosts = async (req, res) => {
  try {
    const postId = req.params.id;
    const jobPost = await JobPost.findOne({ createdBy: { $ne: req.user._id }, isDeleted: false, _id: postId })
      .populate("serviceCategoryId")
      .populate(
        "createdBy",
        "-password -subscriptionHistory -activeSubscriptionId -resetPasswordToken -resetPasswordExpire"
      );
    if (!jobPost) {
      return error(res, "Hustler finding post not found", 404);
    }

    return success(res, "Hustler finding post fetched successfully", jobPost);
  } catch (err) {
    return error(res, "Failed to fetch hustler finding post", 500);
  }
};

const getCurrentSubscriptionPlan = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findOne({ _id: userId, isDeleted: false }).populate({
      path: "activeSubscriptionId",
      populate: [
        {
          path: "planId",
        },
        {
          path: "userId",
          select: "name email",
        },
      ],
    });
    if (!user) {
      return error(res, "User not found", 404);
    }

    if (!user.activeSubscriptionId) {
      return success(res, "No active subscription plan found", null);
    }

    return success(res, "Active subscription plan fetched successfully", user.activeSubscriptionId);
  } catch (err) {
    return error(res, "Failed to fetch active subscription plan", 500);
  }
};

const getBillingHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findOne({ _id: userId, isDeleted: false });
    if (!user) {
      return error(res, "User not found", 404);
    }

    const billingHistory = await Invoice.find({ userId: userId }).sort({ createdAt: -1 }).populate("planId");

    return success(res, "Billing history fetched successfully", billingHistory);
  } catch (err) {
    return error(res, "Failed to fetch billing history", 500);
  }
};

module.exports = {
  getAllHustlers,
  getHustlerById,
  addHustlerServiceForHustler,
  getSingleHustlerServiceForHustler,
  getServiceProvidersByCategory,
  hustlersSearchByServiceName,
  createHustlerFindingPost,
  getAllHustlerFindingPosts,
  getSingleHustlerFindingPosts,
  getCurrentSubscriptionPlan,
  getBillingHistory,
};
