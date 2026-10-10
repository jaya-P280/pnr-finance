import ApiResponse from "../../shared/ApiResponse.js";
import asyncHandler from "../../shared/asyncHandler.js";
import customerDocumentsService from "./customerDocuments.service.js";

class CustomerDocumentsController {
  listDocuments = asyncHandler(async (req, res) => {
    const docs = await customerDocumentsService.getDocumentsList(req.query);
    res.status(200).json(new ApiResponse(200, "Documents retrieved successfully.", docs));
  });

  getByApplication = asyncHandler(async (req, res) => {
    const docs = await customerDocumentsService.getDocumentsByApplicationId(req.params.id);
    res.status(200).json(new ApiResponse(200, "Application documents retrieved successfully.", docs));
  });

  getByCustomer = asyncHandler(async (req, res) => {
    const docs = await customerDocumentsService.getDocumentsByCustomerId(req.params.id);
    res.status(200).json(new ApiResponse(200, "Customer documents retrieved successfully.", docs));
  });

  verifyDocument = asyncHandler(async (req, res) => {
    const doc = await customerDocumentsService.verifyDocument(Number(req.params.id), req.user);
    res.status(200).json(new ApiResponse(200, "Document verified successfully.", doc));
  });

  rejectDocument = asyncHandler(async (req, res) => {
    const doc = await customerDocumentsService.rejectDocument(
      Number(req.params.id),
      req.body.reason,
      req.user
    );
    res.status(200).json(new ApiResponse(200, "Document rejected.", doc));
  });
}

export default new CustomerDocumentsController();
