const { z, ZodError } = require("zod");

const hustlerRegisterSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  role: z.enum(["client", "hustler"], {
    required_error: "Role is required",
  }),
  language: z.string().optional(),
  serviceCategoryId: z.string().min(3, "Service category is required"),
  businessName: z.string().min(3, "Business name is required"),
  businessDesc: z.string().optional(),
});

const clientRegisterSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["client", "hustler"], {
    required_error: "Role is required",
  }),
  language: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const createSubscriptionPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  billingType: z.enum(["monthly", "annual"], {
    required_error: "Billing type is required",
  }),
  price: z.number().min(0, "Price must be a positive number"),
  offerPrice: z.number().min(0, "Offer price must be a positive number"),
  currency: z.string().default("USD"),
  offerText: z.string().optional(),
  features: z
    .array(
      z.object({
        feature: z.string().min(1, "Feature text is required"),
        enabled: z.boolean().default(true),
      })
    )
    .optional(),
});

const createPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  budget: z.preprocess((val) => {
    // Convert string to number if it's a string
    if (typeof val === "string") {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed; // return undefined if not a number
    }
    return val;
  }, z.number().min(0, "Budget must be a positive number")), // number validation
  serviceCategoryId: z.string().min(3, "Service category is required"),
  location: z.string().min(3, "Location is required"),
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      // non-Zod errors
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  };
};

module.exports = {
  hustlerRegisterSchema,
  clientRegisterSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createSubscriptionPlanSchema,
  createPostSchema,
  validateRequest,
};
