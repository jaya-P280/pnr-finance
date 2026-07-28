import * as settingsApi from "../api/settings.api";

class SettingsService {
  async getCompanyProfile() {
    const response = await settingsApi.getCompanyProfile();
    return response.data.data;
  }
  async updateCompanyProfile(payload) {
    const response = await settingsApi.updateCompanyProfile(payload);
    return response.data;
  }
  async getSystemSettings() {
    const response = await settingsApi.getSystemSettings();
    return response.data.data;
  }
  async updateSystemSettings(payload) {
    const response = await settingsApi.updateSystemSettings(payload);
    return response.data;
  }
}

export default new SettingsService();