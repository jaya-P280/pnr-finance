import * as documentSlotsApi from "../api/documentSlots.api";

const documentSlotsService = {
  getAll: (params) => documentSlotsApi.getDocumentSlots(params),
  create: (data) => documentSlotsApi.createDocumentSlot(data),
  update: (id, data) => documentSlotsApi.updateDocumentSlot(id, data),
  delete: (id) => documentSlotsApi.deleteDocumentSlot(id),
};

export default documentSlotsService;
