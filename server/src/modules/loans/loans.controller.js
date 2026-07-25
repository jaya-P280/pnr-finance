import ApiResponse from "../../shared/ApiResponse.js";

import loanService from "./loans.service.js";

import {
  LOAN_MESSAGES,
} from "./loans.constants.js";

class LoanController {

  async createLoan(req, res, next) {
    try {

      const result =
        await loanService.createLoan(
          req.body,
          req.user
        );

      return res.status(201).json(
        new ApiResponse(
          201,
          LOAN_MESSAGES.CREATED,
          result
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async getLoans(req, res, next) {
    try {

      const result =
        await loanService.getLoans(
          req.query
        );

      return res.json(
        new ApiResponse(
          200,
          LOAN_MESSAGES.FETCHED,
          result.loans,
          result.pagination
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async getLoanById(req, res, next) {
    try {

      const result =
        await loanService.getLoanById(
          req.params.id
        );

      return res.json(
        new ApiResponse(
          200,
          LOAN_MESSAGES.FETCHED_ONE,
          result
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async updateLoan(req, res, next) {
    try {

      await loanService.updateLoan(
        req.params.id,
        req.body,
        req.user
      );

      return res.json(
        new ApiResponse(
          200,
          LOAN_MESSAGES.UPDATED
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {

      await loanService.updateStatus(
        req.params.id,
        req.body.status,
        req.user
      );

      return res.json(
        new ApiResponse(
          200,
          LOAN_MESSAGES.STATUS_UPDATED
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async closeLoan(req, res, next) {
    try {

      await loanService.closeLoan(
        req.params.id,
        req.user
      );

      return res.json(
        new ApiResponse(
          200,
          LOAN_MESSAGES.CLOSED
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async forecloseLoan(req, res, next) {
    try {

      await loanService.forecloseLoan(
        req.params.id,
        req.user
      );

      return res.json(
        new ApiResponse(
          200,
          LOAN_MESSAGES.FORECLOSED
        )
      );

    } catch (error) {
      next(error);
    }
  }

  async defaultLoan(req, res, next) {
    try {

      await loanService.defaultLoan(
        req.params.id,
        req.user
      );

      return res.json(
        new ApiResponse(
          200,
          LOAN_MESSAGES.DEFAULTED
        )
      );

    } catch (error) {
      next(error);
    }
  }

}

export default new LoanController();