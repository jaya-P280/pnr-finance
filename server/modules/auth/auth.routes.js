import express from "express";
import authController from "./auth.controller.js";
import { loginValidation, registerValidation, updateProfileValidation, sendOtpValidation } from "./auth.validation.js";
import validationMiddleware from "../../middleware/validation.middleware.js";
import authenticate from "./auth.middleware.js";

const router = express.Router();

router.post("/send-otp", sendOtpValidation, validationMiddleware, authController.sendOtp);
router.post("/login",  loginValidation, validationMiddleware, authController.login);
router.post("/register", registerValidation, validationMiddleware, authController.register);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);
router.get("/me", authenticate, authController.getProfile);
router.put("/me", authenticate, updateProfileValidation, validationMiddleware, authController.updateProfile);

export default router;
