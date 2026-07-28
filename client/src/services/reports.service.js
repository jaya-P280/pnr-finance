import * as reportsApi from "../api/reports.api";

class ReportsService {
  async getLoanReports(params) {
    const { data } = await reportsApi.getLoanReports(params);
    return { reports: data.data ?? [], pagination: data.meta ?? null };
  }
  async getCollectionReports(params) {
    const { data } = await reportsApi.getCollectionReports(params);
    return { reports: data.data ?? [], pagination: data.meta ?? null };
  }
  async getCustomerReports(params) {
    const { data } = await reportsApi.getCustomerReports(params);
    return { reports: data.data ?? [], pagination: data.meta ?? null };
  }
  async getRecoveryReports(params) {
    const response = await reportsApi.getRecoveryReports(params);
    return response.data.data;
  }
}

export default new ReportsService();