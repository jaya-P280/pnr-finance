import { Router } from "express";
import authenticate from "../auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import adminOnly from "../../middleware/adminOnly.middleware.js";
import settingsController from "./settings.controller.js";

const router = Router();

router.get("/company", authenticate, adminOnly, authorize("SETTINGS_VIEW"), settingsController.getProfile);
router.put("/company", authenticate, adminOnly, authorize("SETTINGS_UPDATE"), settingsController.updateProfile);
router.get("/system", authenticate, adminOnly, authorize("SETTINGS_VIEW"), settingsController.getSystem);
router.put("/system", authenticate, adminOnly, authorize("SETTINGS_UPDATE"), settingsController.updateSystem);

export default router;
