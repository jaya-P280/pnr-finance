import db from "../../database/db.js";

class SettingsRepository {
  async getCompanyProfile() {
    const [rows] = await db.execute(`SELECT * FROM company_profile WHERE id=1 LIMIT 1`);
    return rows[0] || null;
  }

  async upsertCompanyProfile(data) {
    const existing = await this.getCompanyProfile();
    if (existing) {
      await db.execute(
        `UPDATE company_profile SET company_name=?, registration_number=?, email=?, phone=?, address=?, city=?, state=?, pincode=?, logo_url=? WHERE id=1`,
        [data.companyName, data.registrationNumber, data.email, data.phone, data.address, data.city, data.state, data.pincode, data.logoUrl || null],
      );
    } else {
      await db.execute(
        `INSERT INTO company_profile (company_name, registration_number, email, phone, address, city, state, pincode, logo_url) VALUES (?,?,?,?,?,?,?,?,?)`,
        [data.companyName, data.registrationNumber, data.email, data.phone, data.address, data.city, data.state, data.pincode, data.logoUrl || null],
      );
    }
    return await this.getCompanyProfile();
  }

  async getSystemSettings() {
    const [rows] = await db.execute(`SELECT * FROM system_settings WHERE id=1 LIMIT 1`);
    return rows[0] || null;
  }

  async upsertSystemSettings(data) {
    const existing = await this.getSystemSettings();
    if (existing) {
      await db.execute(
        `UPDATE system_settings SET default_interest_rate=?, default_processing_fee=?, max_loan_amount=?, min_loan_amount=?, default_currency=?, financial_year=?, enable_sms=?, enable_email=?, enable_whatsapp=? WHERE id=1`,
        [data.defaultInterestRate, data.defaultProcessingFee, data.maxLoanAmount, data.minLoanAmount, data.defaultCurrency, data.financialYear, data.enableSMS ? 1 : 0, data.enableEmail ? 1 : 0, data.enableWhatsApp ? 1 : 0],
      );
    } else {
      await db.execute(
        `INSERT INTO system_settings (default_interest_rate, default_processing_fee, max_loan_amount, min_loan_amount, default_currency, financial_year, enable_sms, enable_email, enable_whatsapp) VALUES (?,?,?,?,?,?,?,?,?)`,
        [data.defaultInterestRate, data.defaultProcessingFee, data.maxLoanAmount, data.minLoanAmount, data.defaultCurrency, data.financialYear, data.enableSMS ? 1 : 0, data.enableEmail ? 1 : 0, data.enableWhatsApp ? 1 : 0],
      );
    }
    return await this.getSystemSettings();
  }
}

export default new SettingsRepository();