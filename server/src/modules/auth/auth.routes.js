import express from "express"
import authController from "./auth.controller.js";
import { loginValidation } from "./auth.validation.js";
import validationMiddleware from "../../middleware/validation.middleware.js";
import authenticate from "./auth.middleware.js";
import loginLimiter from "../../middleware/loginLimiter.js";

const router = express.Router();

router.post(
    "/login",
    loginLimiter,
    loginValidation,
    validationMiddleware,
    authController.login
);

router.post(
    "/refresh-token",
    authenticate,
    authController.refresh
);

router.post(
    "/logout",
    authenticate,
    authController.logout
)

router.get(
    "/me",
    authenticate,
    authController.getProfile,
)

export default router;