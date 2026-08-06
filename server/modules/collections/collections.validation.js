import { body, param, query } from "express-validator";

export const createCollectionValidation = [
  body("loanId").isInt({ min: 1 }).withMessage("Loan is required."),
  body("customerId").isInt({ min: 1 }).withMessage("Customer is required."),
  body("branchId").isInt({ min: 1 }).withMessage("Branch is required."),
  body("collectionDate").isISO8601().withMessage("Valid date required."),
  body("collectionAmount").isFloat({ min: 0.01 }).withMessage("Collection amount must be greater than zero."),
  body("penaltyAmount").optional().isFloat({ min: 0 }),
  body("paymentMethod").optional().isIn(["CASH", "BANK_TRANSFER", "CHEQUE", "ONLINE", "UPI"]),
  body("referenceNumber").optional().trim(),
  body("remarks").optional().trim().isLength({ max: 500 }),
];

export const listCollectionsValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1 }),
  query("search").optional().trim(),
  query("loanId").optional().isInt(),
  query("branchId").optional().isInt(),
  query("status").optional().trim(),
  query("fromDate").optional().isISO8601(),
  query("toDate").optional().isISO8601(),
];

export const collectionIdValidation = [
  param("id").isInt({ min: 1 }),
];