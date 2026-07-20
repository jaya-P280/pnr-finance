import * as authApi from "../api/auth.api";

class AuthService {
  async login(payload) {
    const response = await authApi.login(payload);
    return response.data.data;
  }

  async refresh() {
    const response = await authApi.refresh();
    return response.data.data;
  }

  async logout() {
    const response = await authApi.logout();
    return response.data;
  }

  async getProfile() {
    const response = await authApi.getProfile();
    return response.data.data;
  }
}

export default new AuthService();