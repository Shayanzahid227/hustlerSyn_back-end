const express = require("express");
const {
  login,
  forgotPassword,
  resetPassword,
  registerClient,
  registerHustler,
  getProfile,
} = require("../controllers/CommonControllers/authController");

const { verifyJWT } = require("../middleware/authMiddleware");
const {
  validateRequest,
  clientRegisterSchema,
  hustlerRegisterSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createSubscriptionPlanSchema,
  createPostSchema,
} = require("../validation/authValidation");
const upload = require("../middleware/multer");
const {
  addHustlerService,
  getAllHustlerServices,
  getHustlerServiceById,
  addSubscriptionPlan,
  getAllHustlerSubscriptionPlans,
  getAllClientSubscriptionPlans,
  getSubscriptionPlanById,
} = require("../controllers/CommonControllers/publicController");
const {
  createSubscriptionPaymentSession,
  subscriptionPaymentSuccessCallback,
  subscriptionPaymentCancelCallback,
} = require("../controllers/CommonControllers/paymentController");
const {
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
} = require("../controllers/HustlerControllers/HustlerControllers");

const router = express.Router();

router.post(
  "/auth/register-hustler",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "businessImages", maxCount: 4 },
  ]),
  validateRequest(hustlerRegisterSchema),
  registerHustler
);
router.post("/auth/register-client", upload.single("image"), validateRequest(clientRegisterSchema), registerClient);

router.post("/auth/login", validateRequest(loginSchema), login);
router.post("/auth/forgot-password", validateRequest(forgotPasswordSchema), forgotPassword);
router.post("/auth/reset-password/:token", validateRequest(resetPasswordSchema), resetPassword);

router.get("/profile", verifyJWT, getProfile);

router.post("/hustler-services", addHustlerService);
router.get("/hustler-services", getAllHustlerServices);
router.get("/hustler-services/:id", getHustlerServiceById);

router.post("/subscription-plans", validateRequest(createSubscriptionPlanSchema), addSubscriptionPlan);
router.get("/subscription-plans/hustler", getAllHustlerSubscriptionPlans);
router.get("/subscription-plans/client", getAllClientSubscriptionPlans);
router.get("/subscription-plans/:id", getSubscriptionPlanById);

// Subscription Payment for both Hustlers and Clients
router.post("/payments/subscription-plan/create-session", verifyJWT, createSubscriptionPaymentSession);
router.get("/payment/subscription-plan/success", subscriptionPaymentSuccessCallback);
router.get("/payment/subscription-plan/cancel", subscriptionPaymentCancelCallback);

router.get("/hustlers", verifyJWT, getAllHustlers);
router.get("/hustlers/:id", verifyJWT, getHustlerById);

router.post(
  "/hustlers/hustler-services",
  verifyJWT,
  upload.fields([{ name: "serviceImages", maxCount: 4 }]),
  addHustlerServiceForHustler
);
router.get("/hustlers/hustler-services/:id", verifyJWT, getSingleHustlerServiceForHustler);

router.get("/service-provider-by-category", verifyJWT, getServiceProvidersByCategory);
router.get("/hustlers-search-by-service-name", verifyJWT, hustlersSearchByServiceName);

router.post(
  "/hustler-finding-posts",
  verifyJWT,
  upload.fields([{ name: "postImages", maxCount: 4 }]),
  validateRequest(createPostSchema),
  createHustlerFindingPost
);
router.get("/hustler-finding-posts", verifyJWT, getAllHustlerFindingPosts);
router.get("/hustler-finding-posts/:id", verifyJWT, getSingleHustlerFindingPosts);

router.get("/current-subscription-plan", verifyJWT, getCurrentSubscriptionPlan);
router.get("/billing-history", verifyJWT, getBillingHistory);

module.exports = router;
