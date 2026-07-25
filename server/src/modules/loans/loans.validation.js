import { body, param, query } from "express-validator";

import {
  LOAN_STATUS,
  RECOVERY_FREQUENCY,
} from "./loans.constants.js";

export const createLoanValidation = [

  body("applicationId")
    .isInt({ min: 1 })
    .withMessage("Application is required."),

  body("customerId")
    .isInt({ min: 1 })
    .withMessage("Customer is required."),

  body("branchId")
    .isInt({ min: 1 })
    .withMessage("Branch is required."),

  body("groupId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Invalid group."),

  body("loanProductId")
    .isInt({ min: 1 })
    .withMessage("Loan product is required."),

  body("principalAmount")
    .isFloat({ min: 1 })
    .withMessage("Principal amount must be greater than zero."),

  body("disbursedAmount")
    .isFloat({ min: 1 })
    .withMessage("Disbursed amount must be greater than zero."),

  body("interestRate")
    .isFloat({ min: 0 })
    .withMessage("Invalid interest rate."),

  body("totalInterest")
    .isFloat({ min: 0 })
    .withMessage("Invalid total interest."),

  body("totalPayable")
    .isFloat({ min: 1 })
    .withMessage("Invalid total payable amount."),

  body("outstandingAmount")
    .isFloat({ min: 0 })
    .withMessage("Invalid outstanding amount."),

  body("tenure")
    .isInt({ min: 1 })
    .withMessage("Tenure is required."),

  body("recoveryFrequency")
    .isIn(Object.values(RECOVERY_FREQUENCY))
    .withMessage("Invalid recovery frequency."),

  body("disbursementDate")
    .isISO8601()
    .withMessage("Invalid disbursement date."),

  body("maturityDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Invalid maturity date."),

  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 1000 }),

];

export const updateLoanValidation = [

  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid loan id."),

  body("principalAmount")
    .optional()
    .isFloat({ min: 1 }),

  body("disbursedAmount")
    .optional()
    .isFloat({ min: 1 }),

  body("interestRate")
    .optional()
    .isFloat({ min: 0 }),

  body("totalInterest")
    .optional()
    .isFloat({ min: 0 }),

  body("totalPayable")
    .optional()
    .isFloat({ min: 0 }),

  body("outstandingAmount")
    .optional()
    .isFloat({ min: 0 }),

  body("tenure")
    .optional()
    .isInt({ min: 1 }),

  body("recoveryFrequency")
    .optional()
    .isIn(Object.values(RECOVERY_FREQUENCY)),

  body("disbursementDate")
    .optional()
    .isISO8601(),

  body("maturityDate")
    .optional({ nullable: true })
    .isISO8601(),

  body("remarks")
    .optional()
    .trim()
    .isLength({ max: 1000 }),

];

export const getLoanValidation = [

  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid loan id."),

];

export const deleteLoanValidation = [

  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid loan id."),

];

export const listLoansValidation = [

  query("page")
    .optional()
    .isInt({ min: 1 }),

  query("limit")
    .optional()
    .isInt({ min: 1 }),

  query("search")
    .optional()
    .trim(),

  query("customerId")
    .optional()
    .isInt(),

  query("branchId")
    .optional()
    .isInt(),

  query("loanProductId")
    .optional()
    .isInt(),

  query("status")
    .optional()
    .isIn(Object.values(LOAN_STATUS)),

  query("fromDate")
    .optional()
    .isISO8601(),

  query("toDate")
    .optional()
    .isISO8601(),

  query("sortBy")
    .optional()
    .isIn([
      "loan_number",
      "principal_amount",
      "disbursement_date",
      "created_at",
      "status",
    ]),

  query("sortOrder")
    .optional()
    .isIn([
      "ASC",
      "DESC",
    ]),

];

export const updateLoanStatusValidation = [

  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid loan id."),

  body("status")
    .isIn(Object.values(LOAN_STATUS))
    .withMessage("Invalid loan status."),

];

export const closeLoanValidation = [

  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid loan id."),

];

export const forecloseLoanValidation = [

  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid loan id."),

];

export const defaultLoanValidation = [

  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid loan id."),

];