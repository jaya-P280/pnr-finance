export const LOAN_PRODUCT = {
  PREFIX: "LP",
  PAD_LENGTH: 6,

  STATUS: {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
  },

  RECOVERY_TYPES: [
    "DAILY",
    "WEEKLY",
    "BI_WEEKLY",
    "MONTHLY",
    "YEARLY",
    "ONE_TIME",
  ],

  INTEREST_TYPES: [
    "FLAT",
    "REDUCING",
  ],
};

export const LOAN_PRODUCT_MESSAGES = {
  CREATED: "Loan product created successfully.",
  UPDATED: "Loan product updated successfully.",
  DELETED: "Loan product deleted successfully.",

  NOT_FOUND: "Loan product not found.",

  NAME_EXISTS: "Loan product name already exists.",

  IN_USE: "Loan product is already used by loan applications.",

  STATUS_UPDATED: "Loan product status updated successfully.",
};