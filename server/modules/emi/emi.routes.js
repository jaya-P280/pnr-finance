import { Router } from "express";
import authenticate from "../auth/auth.middleware.js";
import { calculateEMI } from "./emi.service.js";
import ApiResponse from "../../shared/ApiResponse.js";

const router = Router();

router.post("/calculate", authenticate, (req, res) => {
  const { principal, annualRate, tenure, frequency } = req.body;
  const result = calculateEMI(principal, annualRate, tenure, frequency);
  res.json(new ApiResponse(200, "EMI calculated.", result));
});

export default router;