import ApiError from "../../shared/ApiError.js";
import CodeGenerator from "../../shared/codeGenerator.helper.js";
import PaginationHelper from "../../shared/pagination.helper.js";

import loanProductRepository from "./loanProducts.repository.js";
import {
  LOAN_PRODUCT,
  LOAN_PRODUCT_MESSAGES,
} from "./loanProducts.constants.js";

class LoanProductService {
  async createLoanProduct(data, currentUser) {
    const connection =
      await loanProductRepository.beginTransaction();

    try {
      const exists =
        await loanProductRepository.existsByName(
          connection,
          data.productName
        );

      if (exists) {
        throw new ApiError(
          409,
          LOAN_PRODUCT_MESSAGES.NAME_EXISTS
        );
      }

      if (
        Number(data.minimumAmount) >
        Number(data.maximumAmount)
      ) {
        throw new ApiError(
          400,
          "Minimum amount cannot be greater than maximum amount."
        );
      }

      if (
        Number(data.minimumTenure) >
        Number(data.maximumTenure)
      ) {
        throw new ApiError(
          400,
          "Minimum tenure cannot be greater than maximum tenure."
        );
      }

      const lastProduct =
        await loanProductRepository.getLastProductCode();

      const productCode =
        CodeGenerator.generate(
          LOAN_PRODUCT.PREFIX,
          lastProduct?.product_code,
          LOAN_PRODUCT.PAD_LENGTH
        );

      const loanProductId =
        await loanProductRepository.create(
          connection,
          {
            productCode,

            productName: data.productName,
            productType: data.productType,
            interestType: data.interestType,
            recoveryFrequency: data.recoveryFrequency,

            minimumAmount: data.minimumAmount,
            maximumAmount: data.maximumAmount,

            minimumTenure: data.minimumTenure,
            maximumTenure: data.maximumTenure,

            interestRate: data.interestRate,

            processingFeeType:
              data.processingFeeType,

            processingFee:
              data.processingFee,

            insuranceFeeType:
              data.insuranceFeeType,

            insuranceFee:
              data.insuranceFee,

            penaltyType:
              data.penaltyType,

            penalty:
              data.penalty,

            holidayExcluded:
              data.holidayExcluded,

            includeGst:
              data.includeGst,

            description:
              data.description,

            createdBy:
              currentUser.user_id,
          }
        );

      await loanProductRepository.commit(
        connection
      );

      return {
        loanProductId,
        productCode,
      };
    } catch (error) {
      await loanProductRepository.rollback(
        connection
      );

      throw error;
    }
  }

  async getLoanProducts(query) {
    const { page, limit } =
      PaginationHelper.build(query);

    const filters = {
      page,
      limit,

      search:
        query.search?.trim() || null,

      status:
        query.status || null,

      sortBy:
        query.sortBy ||
        "created_at",

      sortOrder:
        query.sortOrder ||
        "DESC",
    };

    const loanProducts =
      await loanProductRepository.findAll(
        filters
      );

    const totalRecords =
      await loanProductRepository.count(
        filters
      );

    return {
      loanProducts,

      pagination:
        PaginationHelper.metadata(
          page,
          limit,
          totalRecords
        ),
    };
  }

  async getLoanProductById(id) {
    const loanProduct =
      await loanProductRepository.findById(id);

    if (!loanProduct) {
      throw new ApiError(
        404,
        LOAN_PRODUCT_MESSAGES.NOT_FOUND
      );
    }

    return loanProduct;
  }

  async updateLoanProduct(
    id,
    data,
    currentUser
  ) {
    const connection =
      await loanProductRepository.beginTransaction();

    try {
      const product =
        await loanProductRepository.findById(id);

      if (!product) {
        throw new ApiError(
          404,
          LOAN_PRODUCT_MESSAGES.NOT_FOUND
        );
      }

      const duplicate =
        await loanProductRepository.existsByName(
          connection,
          data.productName
        );

      if (
        duplicate &&
        product.product_name !==
          data.productName
      ) {
        throw new ApiError(
          409,
          LOAN_PRODUCT_MESSAGES.NAME_EXISTS
        );
      }

      await loanProductRepository.update(
        connection,
        {
          loanProductId: id,

          productName:
            data.productName,

          productType:
            data.productType,

          interestType:
            data.interestType,

          recoveryFrequency:
            data.recoveryFrequency,

          minimumAmount:
            data.minimumAmount,

          maximumAmount:
            data.maximumAmount,

          minimumTenure:
            data.minimumTenure,

          maximumTenure:
            data.maximumTenure,

          interestRate:
            data.interestRate,

          processingFeeType:
            data.processingFeeType,

          processingFee:
            data.processingFee,

          insuranceFeeType:
            data.insuranceFeeType,

          insuranceFee:
            data.insuranceFee,

          penaltyType:
            data.penaltyType,

          penalty:
            data.penalty,

          holidayExcluded:
            data.holidayExcluded,

          includeGst:
            data.includeGst,

          description:
            data.description,

          updatedBy:
            currentUser.user_id,
        }
      );

      await loanProductRepository.commit(
        connection
      );
    } catch (error) {
      await loanProductRepository.rollback(
        connection
      );

      throw error;
    }
  }

  async updateStatus(
    id,
    status,
    currentUser
  ) {
    const connection =
      await loanProductRepository.beginTransaction();

    try {
      await loanProductRepository.updateStatus(
        connection,
        id,
        status,
        currentUser.user_id
      );

      await loanProductRepository.commit(
        connection
      );
    } catch (error) {
      await loanProductRepository.rollback(
        connection
      );

      throw error;
    }
  }

  async deleteLoanProduct(
    id,
    currentUser
  ) {
    const connection =
      await loanProductRepository.beginTransaction();

    try {
      await loanProductRepository.softDelete(
        connection,
        id,
        currentUser.user_id
      );

      await loanProductRepository.commit(
        connection
      );
    } catch (error) {
      await loanProductRepository.rollback(
        connection
      );

      throw error;
    }
  }
}

export default new LoanProductService();