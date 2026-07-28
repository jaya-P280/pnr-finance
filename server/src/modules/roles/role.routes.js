import express from "express";

import authenticate from "../auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validationMiddleware from "../../middleware/validation.middleware.js";

import roleController from "./role.controller.js";

import {
  createRoleValidation,
  updateRoleValidation,
  getRoleValidation,
  deleteRoleValidation,
  updateRoleStatusValidation,
  updateRolePermissionsValidation,
} from "./role.validation.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorize("ROLE_VIEW"),
  roleController.getRoles
);

router.get(
  "/:id",
  authorize("ROLE_VIEW"),
  getRoleValidation,
  validationMiddleware,
  roleController.getRoleById
);

router.post(
  "/",
  authorize("ROLE_CREATE"),
  createRoleValidation,
  validationMiddleware,
  roleController.createRole
);

router.put(
  "/:id",
  authorize("ROLE_UPDATE"),
  updateRoleValidation,
  validationMiddleware,
  roleController.updateRole
);

router.patch(
  "/:id/status",
  authorize("ROLE_UPDATE"),
  updateRoleStatusValidation,
  validationMiddleware,
  roleController.updateRoleStatus
);

router.get(
  "/:id/permissions",
  authorize("ROLE_VIEW"),
  getRoleValidation,
  validationMiddleware,
  roleController.getRolePermissions
);

router.put(
  "/:id/permissions",
  authorize("ROLE_UPDATE"),
  updateRolePermissionsValidation,
  validationMiddleware,
  roleController.updateRolePermissions
);

router.delete(
  "/:id",
  authorize("ROLE_DELETE"),
  deleteRoleValidation,
  validationMiddleware,
  roleController.deleteRole
);

export default router;