import express from "express";
import { saveLetter, getLetters } from "./letters.controller.js";
import authenticate from "../auth/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/", saveLetter);
router.get("/", getLetters);

export default router;
