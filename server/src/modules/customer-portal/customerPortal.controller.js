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
}

export default new CustomerPortalController();
