import { body, param, query } from "express-validator";

export const createUserValidation = [

    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required.")
        .isLength({ min: 2, max: 100 })
        .withMessage("First name must be between 2 and 100 characters."),

    body("lastName")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Last name cannot exceed 100 characters."),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required.")
        .isEmail()
        .withMessage("Invalid email address.")
        .normalizeEmail(),

    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required.")
        .matches(/^[6-9]\d{9}$/)
        .withMessage("Invalid Indian mobile number."),

    body("roleId")
        .notEmpty()
        .withMessage("Role is required.")
        .isInt({ min: 1 })
        .withMessage("Invalid role."),

    body("branchId")
        .notEmpty()
        .withMessage("Branch is required.")
        .isInt({ min: 1 })
        .withMessage("Invalid branch."),

];

export const updateUserValidation = [

    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid user id."),

    body("firstName")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }),

    body("lastName")
        .optional()
        .trim()
        .isLength({ max: 100 }),

    body("email")
        .optional()
        .isEmail()
        .normalizeEmail(),

    body("phone")
        .optional()
        .matches(/^[6-9]\d{9}$/),

    body("roleId")
        .optional()
        .isInt({ min: 1 }),

    body("branchId")
        .optional()
        .isInt({ min: 1 })

];

export const userIdValidation = [

    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid user id.")

];

export const userStatusValidation = [

    param("id")
        .isInt({ min: 1 }),

    body("status")
        .trim()
        .notEmpty()
        .isIn([
            "ACTIVE",
            "INACTIVE",
            "LOCKED"
        ])
        .withMessage("Invalid status.")

];

export const userListValidation = [

    query("page")
        .optional()
        .isInt({ min: 1 }),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 }),

    query("search")
        .optional()
        .trim(),

    query("roleId")
        .optional()
        .trim(),

    query("status")
        .optional()
        .trim(),

    query("branchId")
        .optional()
        .isInt({ min: 1 })

];