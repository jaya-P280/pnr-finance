import * as settingsApi from "../api/settings.api";

class SettingsService {
  async getCompanyProfile() {
    const response = await settingsApi.getCompanyProfile();
    const profile = response.data.data;
    if (!profile) return null;
    return {
      companyName: profile.company_name,
      registrationNumber: profile.registration_number,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
      logoUrl: profile.logo_url,
    };
  }
  async updateCompanyProfile(payload) {
    const response = await settingsApi.updateCompanyProfile(payload);
    return response.data;
  }
  async getSystemSettings() {
    const response = await settingsApi.getSystemSettings();
    const settings = response.data.data;
    if (!settings) return null;
    return {
      defaultInterestRate: settings.default_interest_rate,
      defaultProcessingFee: settings.default_processing_fee,
      maxLoanAmount: settings.max_loan_amount,
      minLoanAmount: settings.min_loan_amount,
      defaultCurrency: settings.default_currency,
      financialYear: settings.financial_year,
      enableSMS: Boolean(settings.enable_sms),
      enableEmail: Boolean(settings.enable_email),
      enableWhatsApp: Boolean(settings.enable_whatsapp),
    };
  }
  async updateSystemSettings(payload) {
    const response = await settingsApi.updateSystemSettings(payload);
    return response.data;
  }
}

export default new SettingsService();
