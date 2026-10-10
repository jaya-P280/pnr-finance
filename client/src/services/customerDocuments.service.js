import * as customerDocsApi from "../api/customerDocuments.api";

const customerDocumentsService = {
  getAll: (params) => customerDocsApi.getAllDocuments(params),
  getByCustomer: (customerId) => customerDocsApi.getDocumentsByCustomer(customerId),
  getByApplication: (applicationId) =>
    customerDocsApi.getDocumentsByApplication(applicationId),
  verify: (id, data) => customerDocsApi.verifyDocument(id, data),
  reject: (id, data) => customerDocsApi.rejectDocument(id, data),
};

export default customerDocumentsService;
