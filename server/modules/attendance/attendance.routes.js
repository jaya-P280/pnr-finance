import express from "express";
import { markAttendance, getAttendance, getAttendanceSummary } from "./attendance.controller.js";
import authenticate from "../auth/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/", markAttendance);
router.get("/", getAttendance);
router.get("/summary", getAttendanceSummary);

export default router;
