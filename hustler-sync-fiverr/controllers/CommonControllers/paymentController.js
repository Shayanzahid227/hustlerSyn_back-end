const stripe = require("../../config/stripe");
const { success, error } = require("../../helpers/response");
const User = require("../../models/User");
const SubscriptionPlan = require("../../models/SubscriptionPlan");
const Subscription = require("../../models/Subscription");
const Invoice = require("../../models/Invoice");

const createSubscriptionPaymentSession = async (req, res) => {
  try {
    const { planId, userId, userRole } = req.body;

    if (!["hustler", "client"].includes(userRole)) {
      return error(res, "Invalid user role", 400);
    }

    const user = await User.findOne({ _id: userId, role: userRole, isDeleted: false });
    if (!user) return error(res, "User plan not found", 404);

    const plan = await SubscriptionPlan.findOne({ _id: planId, planFor: userRole, isDeleted: false });
    if (!plan) return error(res, "Subscription plan not found", 404);

    const priceToCharge = plan.offerPrice || plan.price;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: plan.name,
              description: plan?.offerText || "Hustler Subscription Plan",
            },
            unit_amount: Math.round(priceToCharge * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        planId,
      },
      success_url: `${process.env.BACKEND_URL}/api/payment/subscription-plan/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BACKEND_URL}/api/payment/subscription-plan/cancel`,
    });

    return success(res, "Payment session created successfully", { url: session.url });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const subscriptionPaymentSuccessCallback = async (req, res) => {
  try {
    const { session_id } = req.query;

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) return error(res, "Session not found", 404);

    const userId = session.metadata.userId;
    const planId = session.metadata.planId;

    const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

    if (paymentIntent.status !== "succeeded") {
      return error(res, "Payment not completed", 400);
    }

    const user = await User.findById(userId);
    const plan = await SubscriptionPlan.findById(planId);

    if (!user || !plan) return error(res, "User or plan not found", 404);

    // Calculate expiry
    const startDate = new Date();
    const expiryDate = new Date();

    if (plan.billingType === "monthly") expiryDate.setMonth(expiryDate.getMonth() + 1);
    if (plan.billingType === "annual") expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Create subscription
    const subscription = await Subscription.create({
      userId,
      planId,
      status: "active",
      startedAt: startDate,
      expiresAt: expiryDate,
      stripePaymentId: session.payment_intent,
    });

    // Update user active subscription
    user.activeSubscriptionId = subscription._id;
    user.subscriptionHistory.push(subscription._id);
    await user.save();

    // Create invoice
    await Invoice.create({
      userId,
      subscriptionId: subscription._id,
      planId,
      amountPaid: session.amount_total / 100,
      currency: session.currency,
      stripeInvoiceId: session.id,
      stripePaymentIntentId: session.payment_intent,
      invoiceUrl: session.hosted_invoice_url,
    });

    // Redirect user to frontend page
    return res.redirect(`${process.env.CLIENT_URL}/payment-success?planId=${planId}`);
  } catch (error) {
    console.error("Payment success error:", error);
    return error(res, "Server error", 500);
  }
};

const subscriptionPaymentCancelCallback = async (req, res) => {
  return res.redirect(`${process.env.CLIENT_URL}/payment-cancel`);
};

module.exports = {
  createSubscriptionPaymentSession,
  subscriptionPaymentSuccessCallback,
  subscriptionPaymentCancelCallback,
};
