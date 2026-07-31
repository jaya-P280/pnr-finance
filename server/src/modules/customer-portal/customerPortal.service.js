import ApiError from "../../shared/ApiError.js";
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

  async uploadKycDocument(
    userId,
    files,
    body,
    currentUser,
    metadata,
  ) {
    const customer = await this.getLinkedCustomer(userId);
    return customerService.uploadCustomerKyc(
      customer.customer_id,
      files,
      body,
      currentUser,
      metadata,
    );
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
