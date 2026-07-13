import userController from "./user.controller.js";
import express from "express";
import { createUserValidation, updateUserValidation, userIdValidation, userListValidation, userStatusValidation } from "./user.validation.js";
import validateRequest from "../../middleware/validation.middleware.js";
import authenticate from "../../modules/auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";

const router = express.Router();

router.post("/",
    authenticate,
    authorize("SUPER_ADMIN"),
    createUserValidation,
    validateRequest,
    userController.createUser
);

router.get(
    "/",
    authenticate,
    authorize("SUPER_ADMIN"),
    userListValidation,
    validateRequest,
    userController.getUsers
);

router.get(
    "/:id",
    authenticate,
    authorize("SUPER_ADMIN"),
    userIdValidation,
    validateRequest,
    userController.getUserById
);

router.put("/:id",
    authenticate,
    authorize("SUPER_ADMIN"),
    updateUserValidation,
    validateRequest,
    userController.updateUser
);

router.patch("/:id/status",
    authenticate,
    authorize("SUPER_ADMIN"),
    userStatusValidation,
    validateRequest,
    userController.updateUserStatus
);

export default router;