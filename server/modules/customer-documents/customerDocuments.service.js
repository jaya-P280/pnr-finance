import ApiError from "../../shared/ApiError.js";
import customerDocumentsRepository from "./customerDocuments.repository.js";

class CustomerDocumentsService {
  async getDocumentsList(params) {
    return customerDocumentsRepository.getDocumentsList(params);
  }

  async getDocumentsByApplicationId(applicationId) {
    return customerDocumentsRepository.getDocumentsByApplicationId(Number(applicationId));
  }

  async getDocumentsByCustomerId(customerId) {
    return customerDocumentsRepository.getDocumentsByCustomerId(Number(customerId));
  }

  async verifyDocument(documentId, verifierUser) {
    const doc = await customerDocumentsRepository.findById(documentId);
    if (!doc) {
      throw new ApiError(404, "Document not found.");
    }
    return customerDocumentsRepository.verifyDocument(documentId, verifierUser.user_id);
  }

  async rejectDocument(documentId, reason, verifierUser) {
    const doc = await customerDocumentsRepository.findById(documentId);
    if (!doc) {
      throw new ApiError(404, "Document not found.");
    }
    if (!reason || !reason.trim()) {
      throw new ApiError(400, "Rejection reason is required.");
    }
    return customerDocumentsRepository.rejectDocument(documentId, reason.trim(), verifierUser.user_id);
  }
}

export default new CustomerDocumentsService();
