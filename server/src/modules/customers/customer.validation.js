import { body, param } from "express-validator";

export const createCustomerValidation = [

    body("branchId")
        .isInt({ min: 1 })
        .withMessage("Valid branch is required."),

    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required.")
        .isLength({ max: 100 }),

    body("lastName")
        .optional()
        .trim()
        .isLength({ max: 100 }),

    body("gender")
        .isIn([
            "MALE",
            "FEMALE",
            "OTHER"
        ])
        .withMessage("Invalid gender."),

    body("dateOfBirth")
        .isDate()
        .withMessage("Invalid date of birth."),

    body("mobileNumber")
        .isMobilePhone("en-IN")
        .withMessage("Invalid mobile number."),

    body("alternateMobile")
        .optional()
        .isMobilePhone("en-IN"),

    body("email")
        .optional()
        .isEmail(),

    body("aadhaarNumber")
        .optional()
        .isLength({
            min: 12,
            max: 12
        }),

    body("panNumber")
        .optional()
        .isLength({
            min: 10,
            max: 10
        }),

    body("occupation")
        .optional()
        .isLength({ max: 100 }),

    body("monthlyIncome")
        .optional()
        .isFloat({ min: 0 }),

    body("address")
        .trim()
        .notEmpty(),

    body("city")
        .trim()
        .notEmpty(),

    body("state")
        .trim()
        .notEmpty(),

    body("pincode")
        .isPostalCode("IN")

];

export const getCustomerValidation = [

    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid Customer Id.")

];

export const updateCustomerValidation = [

    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid Customer Id."),

    ...createCustomerValidation

];

export const updateCustomerStatusValidation = [

    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid Customer Id."),

    body("status")
        .isIn([
            "ACTIVE",
            "INACTIVE",
            "BLACKLISTED"
        ])
        .withMessage("Invalid customer status.")

];

export const deleteCustomerValidation = [

    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid Customer Id.")

];