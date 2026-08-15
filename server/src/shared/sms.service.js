import axios from "axios";
import env from "../config/env.js";

class SmsService {
  /**
   * Send SMS to a mobile number
   * @param {Object} options
   * @param {string} options.mobileNumber - 10-digit Indian mobile number
   * @param {string} options.message - Text message content
   */
  async sendSms({ mobileNumber, message }) {
    try {
      const cleanMobile = String(mobileNumber || "").replace(/\D/g, "").slice(-10);
      if (!cleanMobile || cleanMobile.length !== 10) {
        console.warn(`[SMS Service] Invalid mobile number: ${mobileNumber}`);
        return { success: false, message: "Invalid mobile number" };
      }

      const apiKey = env.SMS?.API_KEY || process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY;

      if (apiKey) {
        // Fast2SMS / Gateway HTTP Request
        const response = await axios.post(
          "https://www.fast2sms.com/dev/bulkV2",
          {
            route: "q",
            message: message,
            language: "english",
            flash: 0,
            numbers: cleanMobile,
          },
          {
            headers: {
              authorization: apiKey,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        console.log(`[SMS Service] Live SMS sent to ${cleanMobile}:`, response.data);
        return { success: true, response: response.data };
      } else {
        // Simulated / Sandbox Mode Output
        console.log(`\n=================== [SMS REMINDER SENT (SANDBOX)] ===================`);
        console.log(`TO MOBILE : +91 ${cleanMobile}`);
        console.log(`MESSAGE   : ${message}`);
        console.log(`TIMESTAMP : ${new Date().toLocaleString("en-IN")}`);
        console.log(`====================================================================\n`);

        return {
          success: true,
          mode: "SANDBOX",
          recipient: cleanMobile,
          message,
        };
      }
    } catch (err) {
      console.error(`[SMS Service] Failed to send SMS to ${mobileNumber}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Formats an EMI Due Reminder SMS message
   */
  generateEmiReminderText({ customerName, loanNumber, emiAmount, dueDate, installmentNo }) {
    const formattedAmount = Number(emiAmount || 0).toLocaleString("en-IN");
    const formattedDate = dueDate
      ? new Date(dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
      : "Upcoming Due Date";

    return `Dear ${customerName || "Customer"}, your EMI installment #${installmentNo || 1} of Rs. ${formattedAmount} for Loan #${loanNumber || "LN"} is due on ${formattedDate}. Please pay on time to avoid penalty charges. - PNRG Finance`;
  }
}

export default new SmsService();
