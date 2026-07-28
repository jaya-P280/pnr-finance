import settingsRepository from "./settings.repository.js";

class SettingsService {
  async getCompanyProfile() {
    return await settingsRepository.getCompanyProfile();
  }

  async updateCompanyProfile(data) {
    return await settingsRepository.upsertCompanyProfile(data);
  }

  async getSystemSettings() {
    return await settingsRepository.getSystemSettings();
  }

  async updateSystemSettings(data) {
    return await settingsRepository.upsertSystemSettings(data);
  }
}

export default new SettingsService();