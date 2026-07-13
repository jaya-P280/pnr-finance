import express from "express";
import passwordResetController from "./password-reset.controller.js";

import { setupPasswordValidation, verifyTokenValidation } from "./password-reset.validation.js";
import validateRequest from "../../../middleware/validation.middleware.js";

const router = express.Router();

/* ==========================================================
    VERIFY TOKEN
========================================================== */

router.get(

    "/:token",

    verifyTokenValidation,

    validateRequest,

    passwordResetController.verifyToken

);

/* ==========================================================
    SET PASSWORD
========================================================== */

router.post(

    "/",

    setupPasswordValidation,

    validateRequest,

    passwordResetController.setupPassword

);

export default router;