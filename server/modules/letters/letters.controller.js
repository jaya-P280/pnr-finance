import lettersService from "./letters.service.js";
import asyncHandler from "../../shared/asyncHandler.js";
import ApiResponse from "../../shared/ApiResponse.js";

export const saveLetter = asyncHandler(async (req, res) => {
  const result = await lettersService.saveLetter(req.body, req.user);
  res.status(201).json(new ApiResponse(201, result, "Letter saved successfully."));
});

export const getLetters = asyncHandler(async (req, res) => {
  const records = await lettersService.getLetters(req.user);
  res.status(200).json(new ApiResponse(200, records, "Letters retrieved successfully."));
});
