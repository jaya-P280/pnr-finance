export const LOAN_APPLICATION = {
  PREFIX: "LA",
  PAD_LENGTH: 6,
};

export const LOAN_APPLICATION_STATUS = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  VERIFIED: "VERIFIED",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  DISBURSED: "DISBURSED",
};

export const LOAN_APPLICATION_MESSAGES = {
  CREATED: "Loan application created successfully.",
  UPDATED: "Loan application updated successfully.",
  DELETED: "Loan application deleted successfully.",

  FETCHED: "Loan applications fetched successfully.",
  FETCHED_ONE: "Loan application fetched successfully.",

  STATUS_UPDATED: "Loan application status updated successfully.",

  VERIFIED: "Loan application verified successfully.",
  APPROVED: "Loan application approved successfully.",
  REJECTED: "Loan application rejected successfully.",
  DISBURSED: "Loan application disbursed successfully.",

  NOT_FOUND: "Loan application not found.",

  CUSTOMER_NOT_FOUND: "Customer not found.",
  GROUP_NOT_FOUND: "Customer group not found.",
  LOAN_PRODUCT_NOT_FOUND: "Loan product not found.",

  CUSTOMER_INACTIVE: "Customer is inactive.",
  GROUP_INACTIVE: "Customer group is inactive.",
  LOAN_PRODUCT_INACTIVE: "Loan product is inactive.",

  INVALID_AMOUNT:
    "Requested amount is outside the allowed range.",

  INVALID_TENURE:
    "Requested tenure is outside the allowed range.",

  INVALID_STATUS:
    "Invalid application status transition.",

  APPLICATION_EXISTS:
    "Loan application already exists.",

  DELETE_NOT_ALLOWED:
    "Only draft or pending applications can be deleted.",

  UPDATE_NOT_ALLOWED:
    "Only draft or pending applications can be updated.",
};