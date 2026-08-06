import { body, param, query } from "express-validator";

export const createLoanProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required.")
    .isLength({ max: 150 }),

  body("minAmount").isFloat({ gt: 0 }),

  body("maxAmount").isFloat({ gt: 0 }),

  body("minTenure").isInt({ min: 1 }),

  body("maxTenure").isInt({ min: 1 }),

  body("interestRate").isFloat({ min: 0 }),

  body("interestType").isIn(["FLAT", "REDUCING"]),

  body("recoveryType").isIn([
    "DAILY",
    "WEEKLY",
    "BI_WEEKLY",
    "MONTHLY",
    "YEARLY",
    "ONE_TIME",
  ]),
];

export const updateLoanProductValidation = [
  param("id").isInt(),
  ...createLoanProductValidation,
];
export const updateLoanProductStatusValidation = [
  param("id").isInt().withMessage("Invalid loan product id."),

  body("status")
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Invalid status."),
];

export const getLoanProductValidation = [param("id").isInt()];

export const deleteLoanProductValidation = [param("id").isInt()];

export const listLoanProductsValidation = [
  query("page").optional().isInt(),

  query("limit").optional().isInt(),

  query("search").optional().trim(),

  query("status").optional(),
];
