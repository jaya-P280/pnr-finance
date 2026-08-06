import { body, param, query } from "express-validator";

import {
  LOAN_APPLICATION_STATUS,
} from "./loanApplications.constants.js";

/* -------------------------------------------------------------------------- */
/*                               CREATE APPLICATION                           */
/* -------------------------------------------------------------------------- */

export const createLoanApplicationValidation = [

  body("customerId")
    .isInt({ min: 1 })
    .withMessage("Customer is required."),

  body("groupId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Invalid group."),

  body("loanProductId")
    .isInt({ min: 1 })
    .withMessage("Loan product is required."),

  body("requestedAmount")
    .isFloat({ min: 1 })
    .withMessage("Requested amount must be greater than zero."),

  body("tenure")
    .isInt({ min: 1 })
    .withMessage("Tenure must be greater than zero."),

  body("purpose")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Purpose cannot exceed 255 characters."),

  body("remarks")
    .optional()
    .trim(),

];

/* -------------------------------------------------------------------------- */
/*                               UPDATE APPLICATION                           */
/* -------------------------------------------------------------------------- */

export const updateLoanApplicationValidation = [

  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid application id."),

  body("customerId")
    .isInt({ min: 1 })
    .withMessage("Customer is required."),

  body("groupId")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Invalid group."),

  body("loanProductId")
    .isInt({ min: 1 })
    .withMessage("Loan product is required."),

  body("requestedAmount")
    .isFloat({ min: 1 })
    .withMessage("Requested amount must be greater than zero."),

  body("tenure")
    .isInt({ min: 1 })
    .withMessage("Tenure must be greater than zero."),

  body("purpose")
    .optional()
    .trim()
    .isLength({ max: 255 }),

  body("remarks")
    .optional()
    .trim(),

];

/* -------------------------------------------------------------------------- */
/*                                  GET BY ID                                 */
/* -------------------------------------------------------------------------- */

export const getLoanApplicationValidation = [

  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid application id."),

];

/* -------------------------------------------------------------------------- */
/*                                   DELETE                                   */
/* -------------------------------------------------------------------------- */

export const deleteLoanApplicationValidation = [

  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid application id."),

];

/* -------------------------------------------------------------------------- */
/*                                   LIST                                     */
/* -------------------------------------------------------------------------- */

export const listLoanApplicationsValidation = [

  query("page")
    .optional()
    .isInt({ min: 1 }),

  query("limit")
    .optional()
    .isInt({ min: 1 }),

  query("customerId")
    .optional()
    .isInt(),

  query("groupId")
    .optional()
    .isInt(),

  query("loanProductId")
    .optional()
    .isInt(),

  query("status")
    .optional()
    .isIn(Object.values(LOAN_APPLICATION_STATUS))
    .withMessage("Invalid status."),

  query("search")
    .optional()
    .trim(),

  query("sortBy")
    .optional()
    .isIn([
      "application_number",
      "requested_amount",
      "application_status",
      "created_at",
    ]),

  query("sortOrder")
    .optional()
    .isIn([
      "ASC",
      "DESC",
    ]),

];

/* -------------------------------------------------------------------------- */
/*                             UPDATE STATUS                                  */
/* -------------------------------------------------------------------------- */

export const updateApplicationStatusValidation = [

  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid application id."),

  body("status")
    .isIn(Object.values(LOAN_APPLICATION_STATUS))
    .withMessage("Invalid application status."),

];

/* -------------------------------------------------------------------------- */
/*                                REJECT                                      */
/* -------------------------------------------------------------------------- */

export const rejectLoanApplicationValidation = [

  param("id")
    .isInt({ min: 1 }),

  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Rejection reason is required."),

];