const { z } = require("zod");

const updateProfileSchema = z.object({
  name: z.string().min(3).optional(),
  phone: z.string().optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      zip: z.string().optional(),
    })
    .optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

const changePhoneSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
});

module.exports = {
  updateProfileSchema,
  changePasswordSchema,
  changePhoneSchema,
};
