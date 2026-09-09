import ApiError from "../../shared/ApiError.js";
import aadhaarService from "../../shared/aadhaar.service.js";
import customerService from "../customers/customer.service.js";
import loanApplicationService from "../loan-applications/loanApplications.service.js";
import customerPortalRepository from "./customerPortal.repository.js";

class CustomerPortalService {
  async getMyProfile(userId) {
    const profile = await customerPortalRepository.getProfileByUserId(userId);
    if (!profile) {
      throw new ApiError(404, "Profile not found.");
    }
    return profile;
  }

  async updateMyProfile(userId, data) {
    const profile = await customerPortalRepository.getProfileByUserId(userId);
    if (!profile) {
      throw new ApiError(404, "Profile not found.");
    }

    return customerPortalRepository.updateProfile(
      userId,
      profile.customerId,
      data,
    );
  }

  async createApplication(userId, data, currentUser) {
    const customer = await this.getLinkedCustomer(userId);

    // Require both Aadhaar and PAN verification before applying for a loan
    const kyc = await customerPortalRepository.getKycStatus(customer.customer_id);
    const isAadhaarVerified = Boolean(kyc?.aadhaarVerified);
    const isPanVerified = Boolean(kyc?.panVerified);

    if (!isAadhaarVerified || !isPanVerified) {
      throw new ApiError(
        403,
        "Both Aadhaar and PAN verification must be completed before applying for a loan.",
      );
    }

    return loanApplicationService.createLoanApplication(
      {
        customerId: customer.customer_id,
        groupId: null,
        loanProductId: data.loanProductId,
        requestedAmount: data.requestedAmount,
        tenure: data.tenure,
        purpose: data.purpose,
        remarks: data.remarks,
      },
      currentUser,
    );
  }

  async getMyApplications(userId, filters) {
    const customer = await this.getLinkedCustomer(userId);
    return customerPortalRepository.getApplicationsByCustomerId(
      customer.customer_id,
      filters,
    );
  }

  async getApplicationDetails(userId, applicationId) {
    const customer = await this.getLinkedCustomer(userId);
    const application =
      await customerPortalRepository.getApplicationById(applicationId);

    if (!application || application.customerId !== customer.customer_id) {
      throw new ApiError(404, "Application not found.");
    }

    return application;
  }

  async withdrawApplication(userId, applicationId) {
    const application = await this.getApplicationDetails(userId, applicationId);

    if (!["DRAFT", "PENDING"].includes(application.status)) {
      throw new ApiError(
        400,
        "Only draft or pending applications can be withdrawn.",
      );
    }

    await loanApplicationService.deleteLoanApplication(applicationId);
    return { applicationId, status: "WITHDRAWN" };
  }

  async getMyLoans(userId, filters) {
    const customer = await this.getLinkedCustomer(userId);
    return customerPortalRepository.getLoansByCustomerId(
      customer.customer_id,
      filters,
    );
  }

  async getLoanDetails(userId, loanId) {
    const customer = await this.getLinkedCustomer(userId);
    const loan = await customerPortalRepository.getLoanById(loanId);

    if (!loan || loan.customerId !== customer.customer_id) {
      throw new ApiError(404, "Loan not found.");
    }

    return loan;
  }

  async getRepaymentSchedule(userId, loanId) {
    await this.getLoanDetails(userId, loanId);
    return customerPortalRepository.getRepaymentSchedule(loanId);
  }

  async getDisbursementDetails(userId, loanId) {
    await this.getLoanDetails(userId, loanId);
    return customerPortalRepository.getDisbursementDetails(loanId);
  }

  async getKycStatus(userId) {
    const customer = await this.getLinkedCustomer(userId);
    const status = await customerPortalRepository.getKycStatus(
      customer.customer_id,
    );

    return (
      status || {
        status: "NOT_SUBMITTED",
        aadhaarVerified: false,
        panVerified: false,
        verifiedAt: null,
        remarks: null,
      }
    );
  }

  async verifyDigiLockerKyc(userId, data) {
    const customer = await this.getLinkedCustomer(userId);
    if (!data.aadhaarNumber) {
      throw new ApiError(400, "Aadhaar number is required");
    }
    return customerPortalRepository.updateDigiLockerKyc(customer.customer_id, {
      aadhaarNumber: data.aadhaarNumber,
      digilockerRefId: data.digilockerRefId || `DGL-${Date.now()}`,
    });
  }

  async generateAadhaarOtp(userId, data) {
    // Validate that the user exists and has a linked customer profile
    await this.getLinkedCustomer(userId);
    if (!data.aadhaarNumber) {
      throw new ApiError(400, "Aadhaar number is required");
    }
    
    // Call Sandbox API
    const result = await aadhaarService.generateOtp(data.aadhaarNumber);
    return result;
  }

  async verifyAadhaarOtp(userId, data) {
    const customer = await this.getLinkedCustomer(userId);
    if (!data.reference_id || !data.otp) {
      throw new ApiError(400, "reference_id and otp are required");
    }

    // Verify OTP with Sandbox API
    const result = await aadhaarService.verifyOtp(data.reference_id, data.otp);
    
    if (result.success) {
      // Safely update the database now that KYC is verified
      // Format to fit strictly inside VARCHAR(12) or similar tiny columns:
      const safeAadhaar = (result.maskedAadhaar || "VERIFIED").replace(/-/g, "").substring(0, 12);
      
      await customerPortalRepository.updateAadhaarKyc(customer.customer_id, {
        aadhaarNumber: safeAadhaar,
        referenceId: result.reference_id,
      });
    }
    
    return result;
  }

  async verifyPanKyc(userId, data) {
    const customer = await this.getLinkedCustomer(userId);
    if (!data.panNumber) {
      throw new ApiError(400, "PAN number is required");
    }
    return customerPortalRepository.updatePanKyc(customer.customer_id, {
      panNumber: data.panNumber.toUpperCase(),
    });
  }

  async getLinkedCustomer(userId) {
    let customer = await customerPortalRepository.getCustomerByUserId(userId);
    if (!customer) customer = await customerPortalRepository.createCustomerForUser(userId);
    if (!customer) {
      throw new ApiError(
        404,
        "No customer profile is linked to this account. Ask an administrator to create a customer record with the same email address.",
      );
    }
    return customer;
  }
}

export default new CustomerPortalService();
