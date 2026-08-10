import nodemailer from "nodemailer";
import env from "../config/env.js";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.MAIL?.HOST || "smtp.gmail.com",
      port: Number(env.MAIL?.PORT) || 587,
      secure: Number(env.MAIL?.PORT) === 465,
      auth: {
        user: env.MAIL?.USER || "jpuncool1928@gmail.com",
        pass: env.MAIL?.PASSWORD || "eatudfltwwulttvd",
      },
    });
  }

  async sendEmail({ to, subject, html, text }) {
    try {
      const mailOptions = {
        from: env.MAIL?.FROM || `"PNRG Finance" <${env.MAIL?.USER || "jpuncool1928@gmail.com"}>`,
        to,
        subject,
        html,
        text: text || "Welcome to PNRG Finance Microfinance ERP.",
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${to}: MessageId=${info.messageId}`);
      return info;
    } catch (err) {
      console.error(`Failed to send email to ${to}:`, err.message);
      return null;
    }
  }

  generateWelcomeTemplate({ name, username, tempPassword, role, employeeCode }) {
    const loginUrl = `${env.APP_URL || "http://localhost:5173"}/login`;
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #0F766E; padding: 24px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">PNRG FINANCE</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">MICROFINANCE ERP SOLUTIONS LTD.</p>
        </div>
        
        <div style="padding: 32px; color: #1E293B;">
          <h2 style="color: #0F766E; margin-top: 0;">Welcome to the Team, ${name}!</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #334155;">
            Your account has been officially created as a <strong>${role || "Staff Officer"}</strong> at PNRG Finance Microfinance ERP. Below are your login credentials:
          </p>
          
          <div style="background-color: #F8FAFC; border: 1px solid #CBD5E1; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Employee Code:</strong> ${employeeCode || "N/A"}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Username / Email:</strong> ${username}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #E2E8F0; padding: 2px 6px; border-radius: 4px;">${tempPassword || "Pnrg@123456"}</span></p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${loginUrl}" style="background-color: #0F766E; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
              Login to PNRG Finance ERP
            </a>
          </div>

          <p style="font-size: 13px; color: #64748B; line-height: 1.5;">
            For security reasons, we recommend changing your password after your first login.
          </p>
        </div>

        <div style="background-color: #F1F5F9; padding: 16px; text-align: center; font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0;">
          &copy; ${new Date().getFullYear()} PNRG Finance Microfinance ERP Solutions. All rights reserved.
        </div>
      </div>
    `;
  }
}

export default new EmailService();
