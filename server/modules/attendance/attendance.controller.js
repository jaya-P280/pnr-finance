import attendanceService from "./attendance.service.js";
import asyncHandler from "../../shared/asyncHandler.js";
import ApiResponse from "../../shared/ApiResponse.js";

export const markAttendance = asyncHandler(async (req, res) => {
  const result = await attendanceService.markAttendance(req.body, req.user);
  res.status(200).json(new ApiResponse(200, result, "Attendance logged successfully."));
});

export const getAttendance = asyncHandler(async (req, res) => {
  const records = await attendanceService.getAttendance(req.query, req.user);
  res.status(200).json(new ApiResponse(200, records, "Attendance records fetched successfully."));
});

export const getAttendanceSummary = asyncHandler(async (req, res) => {
  const summary = await attendanceService.getSummary(req.query, req.user);
  res.status(200).json(new ApiResponse(200, summary, "Attendance summary fetched successfully."));
});
