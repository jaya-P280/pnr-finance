import { body, param, query } from "express-validator";

export const createGroupValidation = [
  body("groupName").trim().notEmpty().withMessage("Group name is required."),
  body("branchId").isInt({ min: 1 }).withMessage("Branch is required."),
  body("description").optional().trim(),
  body("meetingDay").optional().trim(),
  body("status").optional().isIn(["ACTIVE", "INACTIVE"]),
  body("memberIds").optional().isArray(),
];

export const updateGroupValidation = [
  param("id").isInt({ min: 1 }),
  body("groupName").optional().trim().notEmpty(),
  body("branchId").optional().isInt({ min: 1 }),
  body("description").optional().trim(),
  body("meetingDay").optional().trim(),
  body("status").optional().isIn(["ACTIVE", "INACTIVE", "DISSOLVED"]),
];

export const listGroupsValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1 }),
  query("search").optional().trim(),
  query("branchId").optional().isInt(),
  query("status").optional().trim(),
];

export const groupIdValidation = [
  param("id").isInt({ min: 1 }).withMessage("Invalid group ID."),
];

export const addMemberValidation = [
  param("id").isInt({ min: 1 }),
  body("customerId").isInt({ min: 1 }).withMessage("Customer is required."),
];

export const attendanceValidation = [
  body("groupId").isInt({ min: 1 }),
  body("meetingDate").isISO8601().withMessage("Valid meeting date required."),
  body("attendance").isArray({ min: 1 }).withMessage("At least one attendance record required."),
  body("attendance.*.customerId").isInt({ min: 1 }),
  body("attendance.*.status").isIn(["PRESENT", "ABSENT", "LATE"]),
];