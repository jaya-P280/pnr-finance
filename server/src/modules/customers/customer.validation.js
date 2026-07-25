import { body, param } from "express-validator";

export const createCustomerValidation = [
  body("branchId").isInt({ min: 1 }).withMessage("Valid branch is required."),
  body("firstName").trim().notEmpty().withMessage("First name is required.").isLength({ max: 100 }),
  body("lastName").optional().trim().isLength({ max: 100 }),
  body("gender").isIn(["MALE", "FEMALE", "OTHER"]).withMessage("Invalid gender."),
  body("dateOfBirth").isDate().withMessage("Invalid date of birth."),
  body("mobileNumber").isMobilePhone("en-IN").withMessage("Invalid mobile number."),
  body("alternateMobile").optional().isMobilePhone("en-IN"),
  body("email").optional().isEmail(),
  body("aadhaarNumber").optional().isLength({ min: 12, max: 12 }),
  body("panNumber").optional().isLength({ min: 10, max: 10 }),
  body("occupation").optional().isLength({ max: 100 }),
  body("monthlyIncome").optional().isFloat({ min: 0 }),
  body("address").trim().notEmpty(),
  body("city").trim().notEmpty(),
  body("state").trim().notEmpty(),
  body("pincode").isPostalCode("IN"),
];

export const getCustomerValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid Customer Id."),
];

export const updateCustomerValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid Customer Id."),
  ...createCustomerValidation,
];

export const updateCustomerStatusValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid Customer Id."),
  body("status").isIn(["ACTIVE", "INACTIVE", "BLACKLISTED"]).withMessage("Invalid customer status."),
];

export const deleteCustomerValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid Customer Id."),
];

export const uploadCustomerKycValidation = [
  param("id").isInt().withMessage("Invalid customer id."),
  body("aadhaarNumber")
    .trim()
    .notEmpty()
    .withMessage("Aadhaar number is required.")
    .isLength({ min: 12, max: 12 })
    .withMessage("Aadhaar number must be 12 digits.")
    .isNumeric()
    .withMessage("Invalid Aadhaar number."),
  body("panNumber")
    .trim()
    .notEmpty()
    .withMessage("PAN number is required.")
    .isLength({ min: 10, max: 10 })
    .withMessage("PAN number must be 10 characters."),
  body("aadhaarFront").optional({ nullable: true }).isString(),
  body("aadhaarBack").optional({ nullable: true }).isString(),
  body("panImage").optional({ nullable: true }).isString(),
];

export const verifyCustomerKycValidation = [
  param("id").isInt().withMessage("Invalid customer id."),
];

export const rejectCustomerKycValidation = [
  param("id").isInt().withMessage("Invalid customer id."),
  body("remarks")
    .trim()
    .notEmpty()
    .withMessage("Remarks are required.")
    .isLength({ max: 500 })
    .withMessage("Remarks cannot exceed 500 characters."),
];

export const createCustomerFamilyValidation = [
  param("id").isInt().withMessage("Invalid customer id."),
  body("memberName").trim().notEmpty().withMessage("Member name is required.").isLength({ max: 150 }),
  body("relationship").trim().notEmpty().withMessage("Relationship is required.").isLength({ max: 50 }),
  body("age").isInt({ min: 0, max: 120 }).withMessage("Invalid age."),
  body("occupation").trim().optional().isLength({ max: 100 }),
  body("mobile")
    .trim()
    .optional()
    .isLength({ min: 10, max: 10 })
    .withMessage("Invalid mobile number.")
    .isNumeric()
    .withMessage("Invalid mobile number."),
];

export const updateCustomerFamilyValidation = [
  param("familyId").isInt().withMessage("Invalid family id."),
  body("memberName").trim().notEmpty().withMessage("Member name is required."),
  body("relationship").trim().notEmpty().withMessage("Relationship is required."),
  body("age").isInt({ min: 0, max: 120 }),
  body("occupation").optional(),
  body("mobile").optional().isLength({ min: 10, max: 10 }).isNumeric(),
];

export const deleteCustomerFamilyValidation = [
  param("familyId").isInt().withMessage("Invalid family id."),
];

export const createCustomerNomineeValidation = [
  param("id").isInt().withMessage("Invalid customer id."),
  body("nomineeName").trim().notEmpty().withMessage("Nominee name is required.").isLength({ max: 150 }),
  body("relationship").trim().notEmpty().withMessage("Relationship is required.").isLength({ max: 50 }),
  body("dateOfBirth").optional({ nullable: true }).isISO8601().withMessage("Invalid date of birth."),
  body("mobile")
    .optional({ nullable: true })
    .isLength({ min: 10, max: 10 })
    .withMessage("Mobile number must be 10 digits.")
    .isNumeric()
    .withMessage("Invalid mobile number."),
  body("address").optional({ nullable: true }).isLength({ max: 500 }),
  body("percentage").optional({ nullable: true }).isFloat({ min: 0, max: 100 }).withMessage("Invalid percentage."),
];

export const updateCustomerNomineeValidation = [
  param("nomineeId").isInt().withMessage("Invalid nominee id."),
  body("nomineeName").trim().notEmpty().withMessage("Nominee name is required."),
  body("relationship").trim().notEmpty().withMessage("Relationship is required."),
  body("dateOfBirth").optional({ nullable: true }).isISO8601(),
  body("mobile").optional({ nullable: true }).isLength({ min: 10, max: 10 }).isNumeric(),
  body("address").optional({ nullable: true }),
  body("percentage").optional({ nullable: true }).isFloat({ min: 0, max: 100 }),
];

export const deleteCustomerNomineeValidation = [
  param("nomineeId").isInt().withMessage("Invalid nominee id."),
];