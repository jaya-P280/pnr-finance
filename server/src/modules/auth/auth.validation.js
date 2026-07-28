import { body } from "express-validator";

export const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

export const registerValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required."),
  body("lastName").optional().trim(),
  body("email").isEmail().withMessage("Valid email is required.").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
  body("mobileNumber").optional().trim(),
  body("branchId").optional().isInt({ min: 1 }),
];