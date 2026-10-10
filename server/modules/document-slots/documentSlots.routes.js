import { Router } from "express";
import authenticate from "../auth/auth.middleware.js";
import adminOnly from "../../middleware/adminOnly.middleware.js";
import documentSlotsController from "./documentSlots.controller.js";

const router = Router();

router.use(authenticate);

// Listing slots is available to all authenticated roles (Customer, Staff, Admin)
router.get("/", documentSlotsController.listSlots);

// Managing slots is restricted to Admin
router.post("/", adminOnly, documentSlotsController.createSlot);
router.put("/:id", adminOnly, documentSlotsController.updateSlot);
router.delete("/:id", adminOnly, documentSlotsController.deleteSlot);

export default router;
