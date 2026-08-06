import { Router } from "express";
import authenticate from "../auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validateRequest from "../../middleware/validation.middleware.js";
import groupController from "./groups.controller.js";
import {
  createGroupValidation, updateGroupValidation, listGroupsValidation,
  groupIdValidation, addMemberValidation, attendanceValidation,
} from "./groups.validation.js";

const router = Router();

router.post("/", authenticate, authorize("GROUP_CREATE"), createGroupValidation, validateRequest, groupController.create);
router.get("/", authenticate, authorize("GROUP_VIEW"), listGroupsValidation, validateRequest, groupController.list);
router.get("/:id", authenticate, authorize("GROUP_VIEW"), groupIdValidation, validateRequest, groupController.getById);
router.put("/:id", authenticate, authorize("GROUP_UPDATE"), updateGroupValidation, validateRequest, groupController.update);
router.delete("/:id", authenticate, authorize("GROUP_DELETE"), groupIdValidation, validateRequest, groupController.delete);

// Members
router.post("/:id/members", authenticate, authorize("GROUP_UPDATE"), addMemberValidation, validateRequest, groupController.addMember);
router.delete("/:id/members/:customerId", authenticate, authorize("GROUP_UPDATE"), groupController.removeMember);

// Attendance
router.post("/:id/attendance", authenticate, authorize("GROUP_UPDATE"), attendanceValidation, validateRequest, groupController.recordAttendance);
router.get("/:id/attendance", authenticate, authorize("GROUP_VIEW"), groupController.getAttendance);

export default router;