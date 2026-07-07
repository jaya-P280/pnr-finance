import express from "express"

import healthRouter from "../modules/health/health.routes.js"

const router = express.Router();

router.use("/health",healthRouter);

export default router;