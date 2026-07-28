import { Router } from "express";
import authenticate from "../auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import settingsController from "./settings.controller.js";

const router = Router();

router.get("/company", authenticate, authorize("SETTINGS_VIEW"), settingsController.getProfile);
router.put("/company", authenticate, authorize("SETTINGS_UPDATE"), settingsController.updateProfile);
router.get("/system", authenticate, authorize("SETTINGS_VIEW"), settingsController.getSystem);
router.put("/system", authenticate, authorize("SETTINGS_UPDATE"), settingsController.updateSystem);

export default router;