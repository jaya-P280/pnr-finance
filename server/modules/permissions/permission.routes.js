import express from "express";

import authenticate from "../auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validationMiddleware from "../../middleware/validation.middleware.js";

import permissionController from "./permission.controller.js";

import { param } from "express-validator";

const router = express.Router();

const permissionIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid permission id."),
];

router.use(authenticate);

router.get(
  "/",
  authorize("PERMISSION_VIEW"),
  permissionController.getPermissions,
);

router.get(
  "/modules",
  authorize("PERMISSION_VIEW"),
  permissionController.getPermissionModules,
);

router.get(
  "/grouped",
  authorize("PERMISSION_VIEW"),
  permissionController.getPermissionsGrouped,
);

router.get(
  "/:id",
  authorize("PERMISSION_VIEW"),
  permissionIdValidation,
  validationMiddleware,
  permissionController.getPermissionById,
);


export default router;
