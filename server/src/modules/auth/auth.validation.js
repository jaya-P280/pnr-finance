import { body } from "express-validator";

export const loginValidation = [
  body().custom((value, { req }) => {
    const input = req.body.identifier || req.body.email || req.body.mobileNumber;
    if (!input || !String(input).trim()) {
      throw new Error("Email address or Mobile number is required.");
    }
    return true;
  }),
  body("password").notEmpty().withMessage("Password is required."),
];

export const registerValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required."),
  body("lastName").optional().trim(),
  body().custom((value, { req }) => {
    const email = req.body.email ? String(req.body.email).trim() : "";
    const mobile = req.body.mobileNumber ? String(req.body.mobileNumber).trim() : "";
    if (!email && !mobile) {
      throw new Error("Either Email address or Mobile number is required.");
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Valid email address is required.");
    }
    if (mobile && !/^\+?\d{10,15}$/.test(mobile.replace(/\s+/g, ""))) {
      throw new Error("Mobile number must be at least 10 digits.");
    }
    return true;
  }),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  body("branchId").optional().isInt({ min: 1 }),
];

export const updateProfileValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required.").isLength({ max: 100 }),
  body("lastName").optional({ nullable: true }).trim().isLength({ max: 100 }),
  body("mobileNumber").optional({ nullable: true }).trim().isMobilePhone("en-IN"),
];
