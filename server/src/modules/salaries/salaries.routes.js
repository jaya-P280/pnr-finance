import express from "express";
import authenticate from "../auth/auth.middleware.js";
import { getSalaries, updateSalaryStructure, processPayroll } from "./salaries.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getSalaries);
router.post("/structure", updateSalaryStructure);
router.post("/payout", processPayroll);

export default router;
