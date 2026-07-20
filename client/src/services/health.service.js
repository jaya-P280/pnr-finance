import * as healthApi from "../api/health.api";

class HealthService {
  async getStatus() {
    const { data } = await healthApi.getHealth();
    return data;
  }
}

export default new HealthService();
