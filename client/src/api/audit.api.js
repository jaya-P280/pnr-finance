import api from "./interceptors";
import ENDPOINTS from "./endpoint";

export const auditApi = {
  getLogs: (params) => api.get(ENDPOINTS.AUDIT, { params }),
  getStats: () => api.get(`${ENDPOINTS.AUDIT}/stats`),
  exportCsv: (params) =>
    api.get(`${ENDPOINTS.AUDIT}/export`, {
      params,
      responseType: "blob",
    }),
};

export default auditApi;
