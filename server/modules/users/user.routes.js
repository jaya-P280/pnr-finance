import userController from "./user.controller.js";
import express from "express";
import { createUserValidation, updateUserValidation, userIdValidation, userListValidation, userStatusValidation, deleteUserValidation, uploadProfileValidation } from "./user.validation.js";
import validateRequest from "../../middleware/validation.middleware.js";
import authenticate from "../../modules/auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";

const router = express.Router();

router.post("/",
    authenticate,
    authorize("USER_CREATE"),
    createUserValidation,
    validateRequest,
    userController.createUser
);

router.get("/",
    authenticate,
    authorize("USER_VIEW"),
    userListValidation,
    validateRequest,
    userController.getUsers
);

router.get("/:id",
    authenticate,
    authorize("USER_VIEW"),
    userIdValidation,
    validateRequest,
    userController.getUserById
);

router.put("/:id",
    authenticate,
    authorize("USER_UPDATE"),
    updateUserValidation,
    validateRequest,
    userController.updateUser
);

router.patch("/:id/status",
    authenticate,
    authorize("USER_UPDATE"),
    userStatusValidation,
    validateRequest,
    userController.updateUserStatus
);

router.delete("/:id",
    authenticate,
    authorize("USER_DELETE"),
    deleteUserValidation,
    validateRequest,
    userController.deleteUser
);

export default router;