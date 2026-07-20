import express from "express";
import pool from "../../database/db.js";
import authenticate from "../auth/auth.middleware.js";
import ApiResponse from "../../shared/ApiResponse.js";

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const [roles] = await pool.execute(`
      SELECT role_id AS roleId, role_name AS roleName
      FROM roles
      WHERE is_active = TRUE
      ORDER BY role_name
    `);

    res.status(200).json(new ApiResponse(200, "Roles fetched successfully.", roles));
  } catch (error) {
    next(error);
  }
});

export default router;
