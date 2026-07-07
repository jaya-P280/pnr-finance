import express from "express"
import authController from "./auth.controller.js";
import { loginValidation } from "./auth.validation.js";
import validationMiddleware from "../../middleware/validation.middleware.js";

const router = express.Router();

router.post(
    "/login",
    loginValidation,
    validationMiddleware,
    authController.login
);

export default router;