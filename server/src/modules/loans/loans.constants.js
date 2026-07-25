export const LOAN = {
  PREFIX: "LN",
  PAD_LENGTH: 6,
};

export const LOAN_STATUS = {
  ACTIVE: "ACTIVE",
  CLOSED: "CLOSED",
  FORECLOSED: "FORECLOSED",
  DEFAULTED: "DEFAULTED",
};

export const RECOVERY_FREQUENCY = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  BI_WEEKLY: "BI_WEEKLY",
  MONTHLY: "MONTHLY",
};

export const LOAN_MESSAGES = {

  CREATED: "Loan created successfully.",

  UPDATED: "Loan updated successfully.",

  DELETED: "Loan deleted successfully.",

  FETCHED: "Loans fetched successfully.",

  FETCHED_ONE: "Loan fetched successfully.",

  STATUS_UPDATED: "Loan status updated successfully.",

  DISBURSED: "Loan disbursed successfully.",

  CLOSED: "Loan closed successfully.",

  FORECLOSED: "Loan foreclosed successfully.",

  DEFAULTED: "Loan marked as defaulted.",

  NOT_FOUND: "Loan not found.",

  APPLICATION_NOT_FOUND: "Loan application not found.",

  APPLICATION_NOT_APPROVED:
    "Loan application must be approved before creating a loan.",

  LOAN_ALREADY_EXISTS:
    "Loan has already been created for this application.",

  CUSTOMER_NOT_FOUND:
    "Customer not found.",

  BRANCH_NOT_FOUND:
    "Branch not found.",

  PRODUCT_NOT_FOUND:
    "Loan product not found.",

  INVALID_STATUS:
    "Invalid loan status.",

  INVALID_DISBURSEMENT_DATE:
    "Invalid disbursement date.",

  INVALID_OUTSTANDING_AMOUNT:
    "Outstanding amount cannot be negative.",

};