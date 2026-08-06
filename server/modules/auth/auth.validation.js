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
  body("aadhaarNumber").optional({ nullable: true, checkFalsy: true }).matches(/^\d{12}$/).withMessage("Aadhaar must be a 12-digit number."),
  body("panNumber").optional({ nullable: true, checkFalsy: true }).matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/).withMessage("Invalid PAN number format (e.g., ABCDE1234F)."),
  body("branchId").optional().isInt({ min: 1 }),
];

export const updateProfileValidation = [
  body("firstName").trim().notEmpty().withMessage("First name is required.").isLength({ max: 100 }),
  body("lastName").optional({ nullable: true }).trim().isLength({ max: 100 }),
  body("mobileNumber").optional({ nullable: true }).trim().isMobilePhone("en-IN"),
];
