import axios from "axios";
import env from "../config/env.js";
import ApiError from "./ApiError.js";

class AadhaarService {
  constructor() {
    this.sandboxBaseUrl = "https://api.sandbox.co.in";
    this.sandboxUrl = `${this.sandboxBaseUrl}/kyc/aadhaar/okyc`; // The Quickstart docs point to api.sandbox.co.in
    this.sandboxAuthToken = process.env.SANDBOX_AUTH_TOKEN || null;
    this.sandboxApiKey = process.env.SANDBOX_API_KEY || null;
    this.sandboxApiSecret = process.env.SANDBOX_API_SECRET || null;
    this.tokenExpiry = null;
  }

  async authenticate() {
    if (this.sandboxAuthToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.sandboxAuthToken;
    }

    if (!this.sandboxApiSecret || this.sandboxApiSecret === "your_sandbox_api_secret_here") {
      return this.sandboxAuthToken;
    }

    try {
      const response = await axios.post(
        `${this.sandboxBaseUrl}/authenticate`,
        {},
        {
          headers: {
            "x-api-key": this.sandboxApiKey,
            "x-api-secret": this.sandboxApiSecret,
            "x-api-version": "1.0",
            "accept": "application/json"
          }
        }
      );
      this.sandboxAuthToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);
      return this.sandboxAuthToken;
    } catch (error) {
      console.error("[Sandbox Auth Error]", error.response?.data || error.message);
      throw new ApiError(500, "Sandbox Authentication Failed");
    }
  }

  async getHeaders() {
    const token = await this.authenticate();
    return {
      Authorization: token,
      "x-api-key": this.sandboxApiKey,
      "Content-Type": "application/json",
      "x-api-version": "1.0",
    };
  }

  isFallbackMode() {
    const isMockKey = !this.sandboxApiKey || this.sandboxApiKey === "your_sandbox_x_api_key_here" || this.sandboxApiKey.trim() === "";
    const hasValidSecret = this.sandboxApiSecret && this.sandboxApiSecret !== "your_sandbox_api_secret_here" && this.sandboxApiSecret.trim() !== "";
    const hasValidAuthToken = this.sandboxAuthToken && this.sandboxAuthToken !== "your_jwt_authorization_token_here" && this.sandboxAuthToken.trim() !== "";

    // We are in fallback mode if we don't have a valid key, OR if we lack BOTH a valid secret and a valid auth token.
    return isMockKey || (!hasValidSecret && !hasValidAuthToken);
  }

  /**
   * Generate OTP for Aadhaar
   * @param {string} aadhaarNumber - 12 digit Aadhaar Number
   */
  async generateOtp(aadhaarNumber) {
    if (this.isFallbackMode()) {
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
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${this.sandboxUrl}/otp`,
        {
          "@entity": "in.co.sandbox.kyc.aadhaar.okyc.otp.request",
          aadhaar_number: aadhaarNumber,
          consent: "y",
          reason: "For KYC Microfinance"
        },
        { headers }
      );

      if (response.data?.code === 200) {
        console.log("[Sandbox Generate OTP Response]:", JSON.stringify(response.data, null, 2));

        if (!response.data.data.reference_id) {
          throw new ApiError(400, `Sandbox: ${response.data.data.message}`);
        }

        return {
          success: true,
          reference_id: response.data.data.reference_id,
          message: response.data.data.message
        };
      }
      throw new ApiError(400, "Failed to generate Aadhaar OTP");
    } catch (error) {
      console.error("[Sandbox Generate OTP Error Details]:", JSON.stringify(error.response?.data, null, 2));

      // Sometimes Sandbox throws 503 but still sends OTP. If they include reference_id in the error, we can salvage it.
      if (error.response?.data?.data?.reference_id) {
        console.log("Salvaged reference_id from error response!");
        return {
          success: true,
          reference_id: error.response.data.data.reference_id,
          message: "OTP sent (with upstream delay)"
        };
      }

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
    if (this.isFallbackMode()) {
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
      const headers = await this.getHeaders();
      const response = await axios.post(
        `${this.sandboxUrl}/otp/verify`,
        {
          "@entity": "in.co.sandbox.kyc.aadhaar.okyc.request",
          reference_id: String(referenceId),
          otp: String(otp)
        },
        { headers }
      );

      if (response.data?.code === 200) {
        const data = response.data.data;

        // Sandbox returns 200 even for wrong OTPs, but includes a message in data
        if (data.message && data.message.toLowerCase().includes("invalid")) {
          throw new ApiError(400, data.message);
        }

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
      console.error("[Sandbox Verify OTP Error Details]:", JSON.stringify(error.response?.data, null, 2));
      const msg = error.response?.data?.message || error.message;
      throw new ApiError(error.response?.status || 500, `Sandbox API Error: ${msg}`);
    }
  }
}

export default new AadhaarService();
