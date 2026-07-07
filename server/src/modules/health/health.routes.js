import express from "express"

import healthController from "./health.controller.js"

const healthRouter = express.Router();


healthRouter.get("/",healthController.getHealth);

export default healthRouter;