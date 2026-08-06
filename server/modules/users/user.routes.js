import userController from "./user.controller.js";
import express from "express";
import { createUserValidation, updateUserValidation, userIdValidation, userListValidation, userStatusValidation, deleteUserValidation, uploadProfileValidation } from "./user.validation.js";
import validateRequest from "../../middleware/validation.middleware.js";
import authenticate from "../../modules/auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";

const router = express.Router();

router.post("/",
    authenticate,
    authorize("ADMINISTRATOR_CREATE", "USER_CREATE"),
    createUserValidation,
    validateRequest,
    userController.createUser
);

router.get("/",
    authenticate,
    authorize("ADMINISTRATOR_VIEW", "USER_VIEW"),
    userListValidation,
    validateRequest,
    userController.getUsers
);

router.get("/:id",
    authenticate,
    authorize("ADMINISTRATOR_VIEW", "USER_VIEW"),
    userIdValidation,
    validateRequest,
    userController.getUserById
);

router.put("/:id",
    authenticate,
    authorize("ADMINISTRATOR_UPDATE", "USER_UPDATE"),
    updateUserValidation,
    validateRequest,
    userController.updateUser
);

router.patch("/:id/status",
    authenticate,
    authorize("ADMINISTRATOR_ACTIVATE", "USER_UPDATE"),
    userStatusValidation,
    validateRequest,
    userController.updateUserStatus
);

router.delete("/:id",
    authenticate,
    authorize("ADMINISTRATOR_DELETE", "USER_DELETE"),
    deleteUserValidation,
    validateRequest,
    userController.deleteUser
);

export default router;