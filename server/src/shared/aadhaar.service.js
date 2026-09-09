import axios from "axios";
import env from "../config/env.js";
import ApiError from "./ApiError.js";

class AadhaarService {
  constructor() {
    this.sandboxUrl = "https://test-api.sandbox.co.in/kyc/aadhaar/okyc";
    this.sandboxAuthToken = process.env.SANDBOX_AUTH_TOKEN || null;
    this.sandboxApiKey = process.env.SANDBOX_API_KEY || null;
  }

  getHeaders() {
    return {
      Authorization: this.sandboxAuthToken,
      "x-api-key": this.sandboxApiKey,
      "Content-Type": "application/json",
      "x-api-version": "1.0",
    };
  }

  /**
   * Generate OTP for Aadhaar
   * @param {string} aadhaarNumber - 12 digit Aadhaar Number
   */
  async generateOtp(aadhaarNumber) {
    if (!this.sandboxAuthToken || !this.sandboxApiKey) {
      console.log(`[Aadhaar Sandbox Fallback] Generating MOCK OTP for ${aadhaarNumber}`);
      // Return a simulated success response
      return {
        success: true,
        reference_id: `mock-ref-${Date.now()}`,
        message: "OTP sent successfully (Simulated Sandbox)",
        isMock: true
      };
    }

    try {
      const response = await axios.post(
        `${this.sandboxUrl}/otp`,
        {
          "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
          aadhaar_number: aadhaarNumber,
          consent: "y",
          reason: "For KYC Microfinance"
        },
        { headers: this.getHeaders() }
      );

      if (response.data?.code === 200) {
        return {
          success: true,
          reference_id: response.data.data.reference_id,
          message: response.data.data.message
        };
      }
      throw new ApiError(400, "Failed to generate Aadhaar OTP");
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      throw new ApiError(error.response?.status || 500, `Sandbox API Error: ${msg}`);
    }
  }

  /**
   * Verify Aadhaar OTP
   * @param {string} referenceId - Reference ID returned from generateOtp
   * @param {string} otp - 6 digit OTP
   */
  async verifyOtp(referenceId, otp) {
    if (!this.sandboxAuthToken || !this.sandboxApiKey) {
      console.log(`[Aadhaar Sandbox Fallback] Verifying MOCK OTP ${otp} for Ref ${referenceId}`);
      if (otp !== "123456") {
        throw new ApiError(400, "Invalid Mock OTP. Use 123456.");
      }
      
      // Return a simulated verified response matching Sandbox schema
      return {
        success: true,
        reference_id: referenceId,
        status: "VALID",
        name: "Sandbox Verified User",
        gender: "M",
        date_of_birth: "01-01-1990",
        care_of: "S/O Mock Parent",
        full_address: "123 Mock Street, Innovation City, 560001",
        maskedAadhaar: "XXXX-XXXX-1234",
        isMock: true
      };
    }

    try {
      const response = await axios.post(
        `${this.sandboxUrl}/otp/verify`,
        {
          "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
          reference_id: referenceId,
          otp: String(otp)
        },
        { headers: this.getHeaders() }
      );

      if (response.data?.code === 200) {
        const data = response.data.data;
        return {
          success: true,
          reference_id: data.reference_id,
          status: data.status,
          name: data.name,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          care_of: data.care_of,
          full_address: data.full_address,
          photo: data.photo, // Base64
        };
      }
      
      throw new ApiError(400, "Failed to verify Aadhaar OTP");
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      throw new ApiError(error.response?.status || 500, `Sandbox API Error: ${msg}`);
    }
  }
}

export default new AadhaarService();
