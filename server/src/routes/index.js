import express from "express";
import healthRoutes from "../modules/health/health.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import userRouter from "../modules/users/user.routes.js";
import passwordResetRoutes from "../modules/auth/password-reset/password-reset.routes.js";
import branchRoutes from "../modules/branches/branch.routes.js";


const router = express.Router();

router.use("/health",healthRoutes);
router.use("/auth",authRoutes);
router.use("/users",userRouter);
router.use("/password",passwordResetRoutes)
router.use("/branches",branchRoutes)

export default router;