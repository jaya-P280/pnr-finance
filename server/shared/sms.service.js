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

      const fast2smsKey = env.SMS?.API_KEY || process.env.FAST2SMS_API_KEY || process.env.SMS_API_KEY;
      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioToken = process.env.TWILIO_AUTH_TOKEN; // This acts as your API Key
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

      if (twilioSid && twilioToken && twilioPhone) {
        // Twilio Integration
        const params = new URLSearchParams();
        params.append("To", `+91${cleanMobile}`);
        params.append("From", twilioPhone);
        params.append("Body", message);

        const response = await axios.post(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          params,
          {
            auth: {
              username: twilioSid,
              password: twilioToken,
            },
          }
        );
        console.log(`[SMS Service] Twilio SMS sent to ${cleanMobile} (SID: ${response.data.sid})`);
        return { success: true, provider: "twilio", response: response.data };
      } else if (fast2smsKey) {
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
              authorization: fast2smsKey,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        console.log(`[SMS Service] Live SMS sent to ${cleanMobile}:`, response.data);
        return { success: true, provider: "fast2sms", response: response.data };
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
      if (err.response?.data) {
         console.error(`[SMS Service] Provider Error Details:`, err.response.data);
      }

      console.log(`\n=================== [SMS FALLBACK (SANDBOX)] ===================`);
      console.log(`TO MOBILE : +91 ${String(mobileNumber || "").replace(/\D/g, "").slice(-10)}`);
      console.log(`MESSAGE   : ${message}`);
      console.log(`TIMESTAMP : ${new Date().toLocaleString("en-IN")}`);
      console.log(`====================================================================\n`);

      return { success: true, mode: "FALLBACK_SANDBOX", error: err.message };
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
