import ApiError from "../../shared/ApiError.js";
import CodeGenerator from "../../shared/codeGenerator.helper.js";
import PaginationHelper from "../../shared/pagination.helper.js";

import loanRepository from "./loans.repository.js";

import {
  LOAN,
  LOAN_MESSAGES,
  LOAN_STATUS,
} from "./loans.constants.js";

class LoanService {

  async createLoan(
    data,
    currentUser
  ) {

    const connection =
      await loanRepository.beginTransaction();

    try {

      const application =
        await loanRepository.findApplication(
          data.applicationId
        );

      if (!application) {
        throw new ApiError(
          404,
          LOAN_MESSAGES.APPLICATION_NOT_FOUND
        );
      }

      if (
        application.application_status !==
        "APPROVED"
      ) {
        throw new ApiError(
          400,
          LOAN_MESSAGES.APPLICATION_NOT_APPROVED
        );
      }

      const exists =
        await loanRepository.existsByApplication(
          data.applicationId
        );

      if (exists) {
        throw new ApiError(
          409,
          LOAN_MESSAGES.LOAN_ALREADY_EXISTS
        );
      }

      const lastLoan =
        await loanRepository.getLastLoanNumber();

      const loanNumber =
        CodeGenerator.generate(
          LOAN.PREFIX,
          lastLoan?.loan_number,
          LOAN.PAD_LENGTH
        );

      const principalAmount =
        Number(data.principalAmount);

      const disbursedAmount =
        Number(data.disbursedAmount);

      const interestRate =
        Number(data.interestRate);

      const totalInterest =
        Number(data.totalInterest);

      const totalPayable =
        Number(data.totalPayable);

      const outstandingAmount =
        Number(data.outstandingAmount);

      const loanId =
        await loanRepository.create(
          connection,
          {

            loanNumber,

            applicationId:
              data.applicationId,

            customerId:
              application.customer_id,

            branchId:
              data.branchId,

            groupId:
              application.group_id,

            loanProductId:
              application.loan_product_id,

            principalAmount,

            disbursedAmount,

            interestRate,

            totalInterest,

            totalPayable,

            outstandingAmount,

            tenure:
              application.tenure,

            recoveryFrequency:
              application.recovery_frequency,

            disbursementDate:
              data.disbursementDate,

            maturityDate:
              data.maturityDate,

            remarks:
              data.remarks,

            createdBy:
              currentUser.user_id,

          }
        );

      await connection.execute(
        `
        UPDATE loan_applications
        SET
          application_status='DISBURSED'
        WHERE application_id=?
        `,
        [
          data.applicationId,
        ]
      );

      await loanRepository.commit(
        connection
      );

      return {
        loanId,
        loanNumber,
      };

    } catch (error) {

      await loanRepository.rollback(
        connection
      );

      throw error;

    }

  }
    async getLoans(query) {

    const {
      page,
      limit,
    } = PaginationHelper.build(query);

    const filters = {

      page,

      limit,

      search:
        query.search?.trim() || null,

      customerId:
        query.customerId || null,

      branchId:
        query.branchId || null,

      loanProductId:
        query.loanProductId || null,

      status:
        query.status || null,

      fromDate:
        query.fromDate || null,

      toDate:
        query.toDate || null,

      sortBy:
        query.sortBy ||
        "created_at",

      sortOrder:
        query.sortOrder ||
        "DESC",

    };

    const loans =
      await loanRepository.findAll(
        filters
      );

    const totalRecords =
      await loanRepository.count(
        filters
      );

    return {

      loans,

      pagination:
        PaginationHelper.metadata(
          page,
          limit,
          totalRecords
        ),

    };

  }

  async getLoanById(id) {

    const loan =
      await loanRepository.findById(id);

    if (!loan) {

      throw new ApiError(
        404,
        LOAN_MESSAGES.NOT_FOUND
      );

    }

    return loan;

  }

  async updateLoan(
    id,
    data,
    currentUser
  ) {

    const connection =
      await loanRepository.beginTransaction();

    try {

      const loan =
        await loanRepository.findById(id);

      if (!loan) {

        throw new ApiError(
          404,
          LOAN_MESSAGES.NOT_FOUND
        );

      }

      await loanRepository.update(
        connection,
        {

          loanId: id,

          principalAmount:
            data.principalAmount,

          disbursedAmount:
            data.disbursedAmount,

          interestRate:
            data.interestRate,

          totalInterest:
            data.totalInterest,

          totalPayable:
            data.totalPayable,

          outstandingAmount:
            data.outstandingAmount,

          tenure:
            data.tenure,

          recoveryFrequency:
            data.recoveryFrequency,

          disbursementDate:
            data.disbursementDate,

          maturityDate:
            data.maturityDate,

          remarks:
            data.remarks,

          updatedBy:
            currentUser.user_id,

        }
      );

      await loanRepository.commit(
        connection
      );

    } catch (error) {

      await loanRepository.rollback(
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
      await loanRepository.beginTransaction();

    try {

      const loan =
        await loanRepository.findById(id);

      if (!loan) {

        throw new ApiError(
          404,
          LOAN_MESSAGES.NOT_FOUND
        );

      }

      await loanRepository.updateStatus(
        connection,
        id,
        status,
        currentUser.user_id
      );

      await loanRepository.commit(
        connection
      );

    } catch (error) {

      await loanRepository.rollback(
        connection
      );

      throw error;

    }

  }
    async closeLoan(
    id,
    currentUser
  ) {

    const connection =
      await loanRepository.beginTransaction();

    try {

      const loan =
        await loanRepository.findById(id);

      if (!loan) {
        throw new ApiError(
          404,
          LOAN_MESSAGES.NOT_FOUND
        );
      }

      if (
        loan.status !==
        LOAN_STATUS.ACTIVE
      ) {
        throw new ApiError(
          400,
          LOAN_MESSAGES.INVALID_STATUS
        );
      }

      await loanRepository.closeLoan(
        connection,
        id,
        currentUser.user_id
      );

      await loanRepository.commit(
        connection
      );

    } catch (error) {

      await loanRepository.rollback(
        connection
      );

      throw error;

    }

  }

  async forecloseLoan(
    id,
    currentUser
  ) {

    const connection =
      await loanRepository.beginTransaction();

    try {

      const loan =
        await loanRepository.findById(id);

      if (!loan) {
        throw new ApiError(
          404,
          LOAN_MESSAGES.NOT_FOUND
        );
      }

      if (
        loan.status !==
        LOAN_STATUS.ACTIVE
      ) {
        throw new ApiError(
          400,
          LOAN_MESSAGES.INVALID_STATUS
        );
      }

      await loanRepository.forecloseLoan(
        connection,
        id,
        currentUser.user_id
      );

      await loanRepository.commit(
        connection
      );

    } catch (error) {

      await loanRepository.rollback(
        connection
      );

      throw error;

    }

  }

  async defaultLoan(
    id,
    currentUser
  ) {

    const connection =
      await loanRepository.beginTransaction();

    try {

      const loan =
        await loanRepository.findById(id);

      if (!loan) {
        throw new ApiError(
          404,
          LOAN_MESSAGES.NOT_FOUND
        );
      }

      if (
        loan.status !==
        LOAN_STATUS.ACTIVE
      ) {
        throw new ApiError(
          400,
          LOAN_MESSAGES.INVALID_STATUS
        );
      }

      await loanRepository.defaultLoan(
        connection,
        id,
        currentUser.user_id
      );

      await loanRepository.commit(
        connection
      );

    } catch (error) {

      await loanRepository.rollback(
        connection
      );

      throw error;

    }

  }

  async applyForLoan(data, currentUser) {
    const connection = await loanRepository.getConnection();

    try {
      await loanRepository.beginTransaction(connection);

      // Validate loan product exists
      const product = await loanRepository.getLoanProductById(
        connection,
        data.loanProductId
      );

      if (!product) {
        throw new Error("Invalid loan product");
      }

      // Validate amount against product limits
      if (data.loanAmount < product.minAmount || data.loanAmount > product.maxAmount) {
        throw new Error(
          `Loan amount must be between ₹${product.minAmount.toLocaleString()} and ₹${product.maxAmount.toLocaleString()}`
        );
      }

      // Create loan application with DRAFT status
      const applicationData = {
        customerId: currentUser.user_id,
        loanProductId: data.loanProductId,
        loanAmount: data.loanAmount,
        tenureMonths: data.tenureMonths,
        loanPurpose: data.loanPurpose,
        repaymentFrequency: data.repaymentFrequency || 'Monthly',
        status: 'DRAFT',
        appliedDate: new Date()
      };

      const application = await loanRepository.createLoanApplication(
        connection,
        applicationData
      );

      await loanRepository.commit(connection);

      return application;

    } catch (error) {
      await loanRepository.rollback(connection);
      throw error;
    }
  }

}

export default new LoanService();
