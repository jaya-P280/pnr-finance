import {body} from "express-validator"

export const loginValidation = [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is Required")
    .isEmail()
    .withMessage("Invalid Email")
    .normalizeEmail(),

    body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({min:8})
    .withMessage("Password must be at leat 8 Chracters")
];