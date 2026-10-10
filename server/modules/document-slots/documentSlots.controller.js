import ApiResponse from "../../shared/ApiResponse.js";
import asyncHandler from "../../shared/asyncHandler.js";
import documentSlotsService from "./documentSlots.service.js";

class DocumentSlotsController {
  listSlots = asyncHandler(async (req, res) => {
    const role = (req.user?.role_name || req.user?.role || "").toUpperCase();
    const slots = await documentSlotsService.getAllSlots(role);
    res.status(200).json(new ApiResponse(200, "Document slots retrieved successfully.", slots));
  });

  createSlot = asyncHandler(async (req, res) => {
    const slot = await documentSlotsService.createSlot(req.body, req.user.user_id);
    res.status(201).json(new ApiResponse(201, "Document slot created successfully.", slot));
  });

  updateSlot = asyncHandler(async (req, res) => {
    const slot = await documentSlotsService.updateSlot(Number(req.params.id), req.body);
    res.status(200).json(new ApiResponse(200, "Document slot updated successfully.", slot));
  });

  deleteSlot = asyncHandler(async (req, res) => {
    await documentSlotsService.deleteSlot(Number(req.params.id));
    res.status(200).json(new ApiResponse(200, "Document slot deactivated successfully."));
  });
}

export default new DocumentSlotsController();
