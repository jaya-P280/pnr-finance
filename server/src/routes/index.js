import express from "express";
import healthRoutes from "../modules/health/health.routes.js";
import authRoutes from "../modules/auth/auth.routes.js";
import userRouter from "../modules/users/user.routes.js";
import passwordResetRoutes from "../modules/auth/password-reset/password-reset.routes.js";
import branchRoutes from "../modules/branches/branch.routes.js";
import customerRoutes from "../modules/customers/customer.routes.js";
import roleRoutes from "../modules/roles/role.routes.js";
import loanRouter from "../modules/loan-products/loanProducts.routes.js";
import loanApplicationRouter from "../modules/loan-applications/loanApplications.routes.js";
import groupRoutes from "../modules/groups/groups.routes.js";
import collectionRoutes from "../modules/collections/collections.routes.js";
import loanRoutes from "../modules/loans/loans.routes.js";
import settingsRoutes from "../modules/settings/settings.routes.js";
import dashboardRoutes from "../modules/dashboard/dashboard.routes.js";
import reportRoutes from "../modules/reports/reports.routes.js";
import emiRoutes from "../modules/emi/emi.routes.js";

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRouter);
router.use("/password", passwordResetRoutes);
router.use("/branches", branchRoutes);
router.use("/customers", customerRoutes);
router.use("/roles", roleRoutes);
router.use("/loan-products", loanRouter);
router.use("/loan-application", loanApplicationRouter);
router.use("/loans", loanRoutes);
router.use("/groups", groupRoutes);
router.use("/collections", collectionRoutes);
router.use("/settings", settingsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/emi", emiRoutes);

export default router;