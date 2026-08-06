import ApiResponse from "../../shared/ApiResponse.js";
import loanProductService from "./loanProducts.service.js";
import {
  LOAN_PRODUCT_MESSAGES,
} from "./loanProducts.constants.js";

class LoanProductController {
  async createLoanProduct(req, res, next) {
    try {
      const result = await loanProductService.createLoanProduct(
        req.body,
        req.user
      );

      return res.status(201).json(
        new ApiResponse(
          201,
          LOAN_PRODUCT_MESSAGES.CREATED,
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async getLoanProducts(req, res, next) {
    try {
      const result = await loanProductService.getLoanProducts(
        req.query
      );

      return res.status(200).json(
        new ApiResponse(
          200,
          "Loan products fetched successfully.",
          result.loanProducts,
          result.pagination
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async getLoanProductById(req, res, next) {
    try {
      const result =
        await loanProductService.getLoanProductById(
          req.params.id
        );

      return res.status(200).json(
        new ApiResponse(
          200,
          "Loan product fetched successfully.",
          result
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async updateLoanProduct(req, res, next) {
    try {
      await loanProductService.updateLoanProduct(
        req.params.id,
        req.body,
        req.user
      );

      return res.status(200).json(
        new ApiResponse(
          200,
          LOAN_PRODUCT_MESSAGES.UPDATED
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async updateLoanProductStatus(req, res, next) {
    try {
      await loanProductService.updateStatus(
        req.params.id,
        req.body.status,
        req.user
      );

      return res.status(200).json(
        new ApiResponse(
          200,
          LOAN_PRODUCT_MESSAGES.STATUS_UPDATED
        )
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteLoanProduct(req, res, next) {
    try {
      await loanProductService.deleteLoanProduct(
        req.params.id,
        req.user
      );

      return res.status(200).json(
        new ApiResponse(
          200,
          LOAN_PRODUCT_MESSAGES.DELETED
        )
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new LoanProductController();