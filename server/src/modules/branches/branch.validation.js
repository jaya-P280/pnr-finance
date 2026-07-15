import { body, param } from "express-validator";

export const createBranchValidation = [

    body("branchName")
        .trim()
        .notEmpty()
        .withMessage("Branch name is required.")
        .isLength({ max: 100 })
        .withMessage("Maximum 100 characters allowed."),

    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required.")
        .isMobilePhone("en-IN")
        .withMessage("Invalid phone number."),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required.")
        .isEmail()
        .withMessage("Invalid email address."),

    body("address")
        .trim()
        .notEmpty()
        .withMessage("Address is required."),

    body("city")
        .trim()
        .notEmpty()
        .withMessage("City is required."),

    body("state")
        .trim()
        .notEmpty()
        .withMessage("State is required."),

    body("pincode")
        .trim()
        .notEmpty()
        .withMessage("Pincode is required.")
        .isPostalCode("IN")
        .withMessage("Invalid pincode.")

];

export const getBranchValidation = [

    param("id")

        .isInt({ min: 1 })

        .withMessage("Invalid Branch Id.")

];

export const updateBranchValidation = [

    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid Branch Id."),

    body("branchName")
        .trim()
        .notEmpty()
        .withMessage("Branch name is required.")
        .isLength({ max: 100 }),

    body("phone")
        .trim()
        .notEmpty()
        .withMessage("Phone number is required.")
        .isMobilePhone("en-IN"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required.")
        .isEmail(),

    body("address")
        .trim()
        .notEmpty()
        .withMessage("Address is required."),

    body("city")
        .trim()
        .notEmpty()
        .withMessage("City is required."),

    body("state")
        .trim()
        .notEmpty()
        .withMessage("State is required."),

    body("pincode")
        .trim()
        .notEmpty()
        .withMessage("Pincode is required.")
        .isPostalCode("IN")

];

export const updateBranchStatusValidation = [

    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid Branch Id."),

    body("status")
        .notEmpty()
        .withMessage("Status is required.")
        .isIn(["ACTIVE", "INACTIVE"])
        .withMessage("Status must be ACTIVE or INACTIVE.")

];

export const deleteBranchValidation = [

    param("id")
        .isInt({ min: 1 })
        .withMessage("Invalid Branch Id.")

];