import { body, param } from "express-validator";

export const setupPasswordValidation = [

    body("token")
        .trim()
        .notEmpty()
        .withMessage("Token is required."),

    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required.")
        .isStrongPassword({

            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1

        })
        .withMessage(
            "Password must contain uppercase, lowercase, number and special character."
        ),

    body("confirmPassword")
        .trim()
        .notEmpty()
        .withMessage("Confirm password is required.")
        .custom((value, { req }) => {

            if (value !== req.body.password) {

                throw new Error(
                    "Passwords do not match."
                );

            }

            return true;

        })

];

export const verifyTokenValidation = [

    param("token")
        .trim()
        .notEmpty()
        .withMessage("Token is required.")

];