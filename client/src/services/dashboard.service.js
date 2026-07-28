import * as dashboardApi from "../api/dashboard.api";

class DashboardService {
  async getStats(params) {
    const response = await dashboardApi.getDashboardStats(params);
    return response.data.data;
  }
}

export default new DashboardService();