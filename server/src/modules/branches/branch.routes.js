import express from "express";

import branchController from "./branch.controller.js";

import {
    createBranchValidation, getBranchValidation, updateBranchValidation, updateBranchStatusValidation, deleteBranchValidation
} from "./branch.validation.js";

import authMiddleware from "../auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validationMiddleware from "../../middleware/validation.middleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorize("MANAGE_BRANCH"),
    createBranchValidation,
    validationMiddleware,
    branchController.createBranch
);

router.get(
    "/",
    authMiddleware,
    branchController.getBranches
);

router.get(
    "/:id",
    authMiddleware,
    getBranchValidation,
    validationMiddleware,
    branchController.getBranchById
);

router.put(
    "/:id",
    authMiddleware,
    authorize("MANAGE_BRANCH"),
    updateBranchValidation,
    validationMiddleware,
    branchController.updateBranch
);

router.patch(
    "/:id/status",
    authMiddleware,
    authorize("MANAGE_BRANCH"),
    updateBranchStatusValidation,
    validationMiddleware,
    branchController.updateBranchStatus
);

router.delete(
    "/:id",
    authMiddleware,
    authorize("MANAGE_BRANCH"),
    deleteBranchValidation,
    validationMiddleware,
    branchController.deleteBranch
);

export default router;