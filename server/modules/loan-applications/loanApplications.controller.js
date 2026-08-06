import ApiResponse from "../../shared/ApiResponse.js";

import loanApplicationService from "./loanApplications.service.js";

import {
  LOAN_APPLICATION_MESSAGES,
} from "./loanApplications.constants.js";

class LoanApplicationController {

  async createLoanApplication(req, res, next) {
    try {

      const result =
        await loanApplicationService.createLoanApplication(
          req.body,
          req.user
        );

      return res.status(201).json(
        new ApiResponse(
          201,
          LOAN_APPLICATION_MESSAGES.CREATED,
          result
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async getLoanApplications(req, res, next) {
    try {

      const result =
        await loanApplicationService.getLoanApplications(
          req.query
        );

      return res.json(
        new ApiResponse(
          200,
          LOAN_APPLICATION_MESSAGES.FETCHED,
          result.loanApplications,
          result.pagination
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async getLoanApplicationById(req, res, next) {
    try {

      const result =
        await loanApplicationService.getLoanApplicationById(
          req.params.id
        );

      return res.json(
        new ApiResponse(
          200,
          LOAN_APPLICATION_MESSAGES.FETCHED_ONE,
          result
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async updateLoanApplication(req, res, next) {
    try {

      await loanApplicationService.updateLoanApplication(
        req.params.id,
        req.body,
        req.user
      );

      return res.json(
        new ApiResponse(
          200,
          LOAN_APPLICATION_MESSAGES.UPDATED
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {

      await loanApplicationService.updateStatus(
        req.params.id,
        req.body.status
      );

      return res.json(
        new ApiResponse(
          200,
          LOAN_APPLICATION_MESSAGES.STATUS_UPDATED
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async verifyApplication(req, res, next) {
    try {

      await loanApplicationService.verifyApplication(
        req.params.id,
        req.user
      );

      return res.json(
        new ApiResponse(
          200,
          LOAN_APPLICATION_MESSAGES.VERIFIED
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async approveApplication(req, res, next) {
    try {

      await loanApplicationService.approveApplication(
        req.params.id,
        req.body.approvedAmount,
        req.user
      );

      return res.json(
        new ApiResponse(
          200,
          LOAN_APPLICATION_MESSAGES.APPROVED
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async rejectApplication(req, res, next) {
    try {

      await loanApplicationService.rejectApplication(
        req.params.id,
        req.body.reason,
        req.user
      );

      return res.json(
        new ApiResponse(
          200,
          LOAN_APPLICATION_MESSAGES.REJECTED
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async disburseApplication(req, res, next) {
    try {

      await loanApplicationService.disburseApplication(
        req.params.id
      );

      return res.json(
        new ApiResponse(
          200,
          LOAN_APPLICATION_MESSAGES.DISBURSED
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async deleteLoanApplication(req, res, next) {
    try {

      await loanApplicationService.deleteLoanApplication(
        req.params.id
      );

      return res.json(
        new ApiResponse(
          200,
          LOAN_APPLICATION_MESSAGES.DELETED
        )
      );

    } catch (error) {
      next(error);
    }
  }

}

export default new LoanApplicationController();