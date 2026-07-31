import { body, param, query } from "express-validator";

export const updateProfileValidation = [
  body("firstName").optional().trim().notEmpty().isLength({ max: 100 }),
  body("lastName").optional().trim().isLength({ max: 100 }),
  body("mobileNumber").optional().trim().isMobilePhone("en-IN"),
  body("address").optional().trim().isLength({ max: 500 }),
  body("city").optional().trim().isLength({ max: 100 }),
  body("state").optional().trim().isLength({ max: 100 }),
  body("pincode").optional().trim().isPostalCode("IN"),
];

export const createApplicationValidation = [
  body("loanProductId").isInt({ min: 1 }),
  body("requestedAmount").isFloat({ min: 1 }),
  body("tenure").isInt({ min: 1 }),
  body("purpose").optional().trim().isLength({ max: 255 }),
  body("remarks").optional().trim().isLength({ max: 1000 }),
];

export const customerListValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status").optional().trim(),
];

export const customerResourceValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid resource ID."),
];

export const uploadKycValidation = [
  body("aadhaarNumber")
    .trim()
    .isLength({ min: 12, max: 12 })
    .isNumeric(),
  body("panNumber")
    .trim()
    .isLength({ min: 10, max: 10 }),
];
