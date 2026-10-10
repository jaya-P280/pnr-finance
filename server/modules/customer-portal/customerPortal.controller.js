import ApiResponse from "../../shared/ApiResponse.js";
import asyncHandler from "../../shared/asyncHandler.js";
import customerPortalService from "./customerPortal.service.js";

class CustomerPortalController {
  getMyProfile = asyncHandler(async (req, res) => {
    const profile = await customerPortalService.getMyProfile(req.user.user_id);
    res.json(new ApiResponse(200, "Profile retrieved successfully.", profile));
  });

  updateMyProfile = asyncHandler(async (req, res) => {
    const profile = await customerPortalService.updateMyProfile(
      req.user.user_id,
      req.body,
    );
    res.json(new ApiResponse(200, "Profile updated successfully.", profile));
  });

  createApplication = asyncHandler(async (req, res) => {
    const application = await customerPortalService.createApplication(
      req.user.user_id,
      req.body,
      req.user,
    );
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          "Loan application submitted successfully.",
          application,
        ),
      );
  });

  getMyApplications = asyncHandler(async (req, res) => {
    const applications = await customerPortalService.getMyApplications(
      req.user.user_id,
      {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
        status: req.query.status || null,
      },
    );
    res.json(
      new ApiResponse(
        200,
        "Applications retrieved successfully.",
        applications,
      ),
    );
  });

  getApplicationDetails = asyncHandler(async (req, res) => {
    const application = await customerPortalService.getApplicationDetails(
      req.user.user_id,
      Number(req.params.id),
    );
    res.json(
      new ApiResponse(
        200,
        "Application details retrieved successfully.",
        application,
      ),
    );
  });

  withdrawApplication = asyncHandler(async (req, res) => {
    const application = await customerPortalService.withdrawApplication(
      req.user.user_id,
      Number(req.params.id),
    );
    res.json(
      new ApiResponse(
        200,
        "Application withdrawn successfully.",
        application,
      ),
    );
  });

  getMyLoans = asyncHandler(async (req, res) => {
    const loans = await customerPortalService.getMyLoans(req.user.user_id, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      status: req.query.status || null,
    });
    res.json(new ApiResponse(200, "Loans retrieved successfully.", loans));
  });

  getLoanDetails = asyncHandler(async (req, res) => {
    const loan = await customerPortalService.getLoanDetails(
      req.user.user_id,
      Number(req.params.id),
    );
    res.json(new ApiResponse(200, "Loan details retrieved successfully.", loan));
  });

  getRepaymentSchedule = asyncHandler(async (req, res) => {
    const schedule = await customerPortalService.getRepaymentSchedule(
      req.user.user_id,
      Number(req.params.id),
    );
    res.json(
      new ApiResponse(
        200,
        "Repayment schedule retrieved successfully.",
        schedule,
      ),
    );
  });

  getDisbursementDetails = asyncHandler(async (req, res) => {
    const disbursement = await customerPortalService.getDisbursementDetails(
      req.user.user_id,
      Number(req.params.id),
    );
    res.json(
      new ApiResponse(
        200,
        "Disbursement details retrieved successfully.",
        disbursement,
      ),
    );
  });

  getKycStatus = asyncHandler(async (req, res) => {
    const status = await customerPortalService.getKycStatus(req.user.user_id);
    res.json(new ApiResponse(200, "KYC status retrieved successfully.", status));
  });

  verifyDigiLockerKyc = asyncHandler(async (req, res) => {
    const result = await customerPortalService.verifyDigiLockerKyc(
      req.user.user_id,
      req.body,
    );
    res.json(new ApiResponse(200, "DigiLocker e-KYC verified successfully.", result));
  });

  verifyPanKyc = asyncHandler(async (req, res) => {
    const result = await customerPortalService.verifyPanKyc(
      req.user.user_id,
      req.body,
    );
    res.json(new ApiResponse(200, "PAN verified successfully.", result));
  });

  generateAadhaarOtp = asyncHandler(async (req, res) => {
    const result = await customerPortalService.generateAadhaarOtp(
      req.user.user_id,
      req.body,
    );
    res.json(new ApiResponse(200, "Aadhaar OTP generated.", result));
  });

  verifyAadhaarOtp = asyncHandler(async (req, res) => {
    const result = await customerPortalService.verifyAadhaarOtp(
      req.user.user_id,
      req.body,
    );
    res.json(new ApiResponse(200, "Aadhaar OTP verified.", result));
  });

  confirmAadhaarKyc = asyncHandler(async (req, res) => {
    const result = await customerPortalService.confirmAadhaarKyc(
      req.user.user_id,
      req.body,
    );
    res.json(new ApiResponse(200, "Aadhaar e-KYC verified and confirmed successfully.", result));
  });

  getMyDocuments = asyncHandler(async (req, res) => {
    const docs = await customerPortalService.getCustomerDocuments(req.user.user_id);
    res.status(200).json(new ApiResponse(200, "Customer documents retrieved successfully.", docs));
  });

  uploadDocument = asyncHandler(async (req, res) => {
    const doc = await customerPortalService.uploadCustomerDocument(
      req.user.user_id,
      req.file,
      req.body
    );
    res.status(201).json(new ApiResponse(201, "Document uploaded successfully.", doc));
  });

  deleteDocument = asyncHandler(async (req, res) => {
    await customerPortalService.deleteCustomerDocument(req.user.user_id, req.params.id);
    res.status(200).json(new ApiResponse(200, "Document deleted successfully."));
  });

  getLoanContract = asyncHandler(async (req, res) => {
    const contract = await customerPortalService.getLoanContractData(
      req.user.user_id,
      req.params.id
    );
    res.status(200).json(new ApiResponse(200, "Loan contract generated successfully.", contract));
  });
}

export default new CustomerPortalController();
