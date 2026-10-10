import ApiError from "../../shared/ApiError.js";
import aadhaarService from "../../shared/aadhaar.service.js";
import customerService from "../customers/customer.service.js";
import loanApplicationService from "../loan-applications/loanApplications.service.js";
import customerPortalRepository from "./customerPortal.repository.js";
import documentSlotsRepository from "../document-slots/documentSlots.repository.js";

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

    // Verify OTP with Sandbox API and retrieve Aadhaar records
    const result = await aadhaarService.verifyOtp(data.reference_id, data.otp);
    
    // Return retrieved details to frontend for user review before confirmation
    const last4 = (data.aadhaarNumber || "").replace(/\D/g, "").slice(-4);
    const maskedAadhaar = result.maskedAadhaar || (last4 ? `XXXX-XXXX-${last4}` : "XXXX-XXXX-XXXX");

    return {
      ...result,
      maskedAadhaar,
      reference_id: result.reference_id || data.reference_id,
      customerId: customer.customer_id,
    };
  }

  async confirmAadhaarKyc(userId, data) {
    const customer = await this.getLinkedCustomer(userId);
    if (!data.reference_id) {
      throw new ApiError(400, "reference_id is required to confirm Aadhaar KYC");
    }

    const safeAadhaar = (data.maskedAadhaar || "VERIFIED").replace(/[^0-9X]/g, "").substring(0, 12);

    return customerPortalRepository.updateAadhaarKyc(customer.customer_id, {
      aadhaarNumber: safeAadhaar,
      referenceId: data.reference_id,
      name: data.name,
      dob: data.dob || data.date_of_birth,
      gender: data.gender,
      address: data.full_address || data.address,
    });
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

  async getCustomerDocuments(userId) {
    const customer = await this.getLinkedCustomer(userId);
    return customerPortalRepository.getCustomerDocuments(customer.customer_id);
  }

  async uploadCustomerDocument(userId, file, data) {
    const customer = await this.getLinkedCustomer(userId);
    if (!file) {
      throw new ApiError(400, "Please select a file to upload (PDF, JPEG, or PNG).");
    }

    const docTypeCode = (
      data.documentTypeCode ||
      data.document_type_code ||
      data.documentType ||
      ""
    ).toUpperCase().trim();
    if (!docTypeCode) {
      throw new ApiError(400, "Document type code is required.");
    }

    const slot = await documentSlotsRepository.getByCode(docTypeCode);
    if (!slot) {
      throw new ApiError(404, `Document type slot '${docTypeCode}' not found.`);
    }

    const fileUrl = `/uploads/documents/${file.filename}`;
    const rawAppId =
      data.applicationId ||
      data.loan_application_id ||
      data.application_id ||
      null;

    return customerPortalRepository.addCustomerDocument({
      customerId: customer.customer_id,
      applicationId: rawAppId ? Number(rawAppId) : null,
      documentTypeId: slot.id,
      documentTypeCode: slot.code,
      documentTitle: slot.title,
      fileUrl,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    });
  }

  async deleteCustomerDocument(userId, documentId) {
    const customer = await this.getLinkedCustomer(userId);
    const deleted = await customerPortalRepository.deleteCustomerDocument(
      Number(documentId),
      customer.customer_id
    );
    if (!deleted) {
      throw new ApiError(400, "Document not found or cannot be removed (only pending documents can be deleted).");
    }
    return { success: true };
  }

  async getLoanContractData(userId, applicationId) {
    const customer = await this.getLinkedCustomer(userId);
    const app = await customerPortalRepository.getApplicationForContract(
      Number(applicationId),
      customer.customer_id
    );

    if (!app) {
      throw new ApiError(404, "Loan application not found.");
    }

    const status = (app.applicationStatus || "").toUpperCase();
    if (!["APPROVED", "DISBURSED"].includes(status)) {
      throw new ApiError(
        400,
        "Loan contract is only available for applications that have been officially APPROVED."
      );
    }

    const principal = Number(app.approvedAmount || app.requestedAmount || 0);
    const rate = Number(app.interestRate || 12);
    const tenure = Number(app.tenure || 12);
    const monthlyRate = rate / 12 / 100;
    let emi = 0;
    if (monthlyRate === 0) {
      emi = Math.round(principal / tenure);
    } else {
      emi = Math.round(
        (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
          (Math.pow(1 + monthlyRate, tenure) - 1)
      );
    }
    const totalPayable = emi * tenure;
    const totalInterest = Math.max(0, totalPayable - principal);

    const contractDate = app.approvedAt ? new Date(app.approvedAt) : new Date();

    return {
      contractNumber: `AGR-${app.applicationNumber}`,
      date: contractDate.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      application: {
        id: app.applicationId,
        number: app.applicationNumber,
        status: app.applicationStatus,
        productName: app.productName,
        productCode: app.productCode,
        purpose: app.purpose,
      },
      borrower: {
        customerId: app.customerId,
        code: app.customerCode,
        name: `${app.firstName} ${app.lastName || ""}`.trim(),
        mobile: app.mobileNumber,
        email: app.email,
        address: `${app.address || ""}, ${app.city || ""}, ${app.state || ""} - ${app.pincode || ""}`.trim(),
        aadhaar: app.aadhaarNumber || "VERIFIED ON FILE",
        pan: app.panNumber || "VERIFIED ON FILE",
      },
      lender: {
        name: "PNRG Finance Microfinance ERP Services Ltd.",
        branchName: app.branchName,
        branchCode: app.branchCode,
        branchAddress: app.branchAddress,
        branchPhone: app.branchPhone,
        branchEmail: app.branchEmail,
      },
      financialTerms: {
        approvedPrincipal: principal,
        interestRateAnnual: rate,
        tenureMonths: tenure,
        frequency: app.recoveryFrequency || "MONTHLY",
        monthlyEmi: emi,
        totalInterestPayable: totalInterest,
        totalRepaymentAmount: totalPayable,
      },
      defaultConsequences: [
        {
          title: "Overdue Penal Charges",
          detail: "A late payment fee / penal interest of 2.0% per month will be charged automatically on any overdue installment from the due date until full clearance.",
        },
        {
          title: "Credit Bureau Reporting & Score Impairment",
          detail: "Any payment delay exceeding 30 days will be reported directly to Credit Information Bureaus (CIBIL, Experian, CRIF High Mark, and Equifax). This will severely degrade the borrower's credit score and restrict future loan eligibility across all Indian banking institutions.",
        },
        {
          title: "Legal Recovery & Statutory Proceedings",
          detail: "In the event of continuous default beyond 60 days, PNRG Finance reserves the statutory right to initiate formal legal recovery proceedings under Section 138 of the Negotiable Instruments Act and applicable civil summary recovery suits.",
        },
        {
          title: "Doorstep Verification & Center Visits",
          detail: "Authorized Field Officers and recovery representatives will conduct official doorstep visits to the registered residence or business address to recover outstanding arrears.",
        },
        {
          title: "Immediate Facility Termination",
          detail: "The entire outstanding principal and accrued interest shall immediately become due and payable in full, and all pre-approved credit limits will be terminated permanently.",
        },
      ],
      generalTerms: [
        "The Borrower agrees to repay the approved loan amount together with interest in designated monthly installments without delay.",
        "The loan disbursed must be strictly utilized for the stated purpose and shall not be used for speculative, illegal, or unauthorized activities.",
        "Prepayment or foreclosure is permitted in accordance with PNRG Finance policy, subject to statutory guidelines and processing clearances.",
        "The Borrower confirms that all identity proofs, eKYC documents, bank statements, and particulars submitted are authentic, accurate, and valid.",
        "Any legal disputes arising under this agreement shall be subject to the exclusive jurisdiction of the competent courts in the branch operational district.",
      ],
    };
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
