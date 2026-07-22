import ApiError from "../../shared/ApiError.js";
import CodeGenerator from "../../shared/codeGenerator.helper.js";
import PaginationHelper from "../../shared/pagination.helper.js";

import loanApplicationRepository from "./loanApplications.repository.js";

import {
  LOAN_APPLICATION,
  LOAN_APPLICATION_STATUS,
  LOAN_APPLICATION_MESSAGES,
} from "./loanApplications.constants.js";

class LoanApplicationService {
  async createLoanApplication(data, currentUser) {
    const connection = await loanApplicationRepository.beginTransaction();

    try {
      const customer = await loanApplicationRepository.findCustomer(
        data.customerId,
      );

      if (!customer) {
        throw new ApiError(404, LOAN_APPLICATION_MESSAGES.CUSTOMER_NOT_FOUND);
      }

      if (customer.status !== "ACTIVE") {
        throw new ApiError(400, LOAN_APPLICATION_MESSAGES.CUSTOMER_INACTIVE);
      }

      if (data.groupId) {
        const group = await loanApplicationRepository.findGroup(data.groupId);

        if (!group) {
          throw new ApiError(404, LOAN_APPLICATION_MESSAGES.GROUP_NOT_FOUND);
        }

        if (group.status !== "ACTIVE") {
          throw new ApiError(400, LOAN_APPLICATION_MESSAGES.GROUP_INACTIVE);
        }
      }

      const loanProduct = await loanApplicationRepository.findLoanProduct(
        data.loanProductId,
      );

      if (!loanProduct) {
        throw new ApiError(
          404,
          LOAN_APPLICATION_MESSAGES.LOAN_PRODUCT_NOT_FOUND,
        );
      }

      if (loanProduct.status !== "ACTIVE") {
        throw new ApiError(
          400,
          LOAN_APPLICATION_MESSAGES.LOAN_PRODUCT_INACTIVE,
        );
      }

      if (
        Number(data.requestedAmount) < Number(loanProduct.minimum_amount) ||
        Number(data.requestedAmount) > Number(loanProduct.maximum_amount)
      ) {
        throw new ApiError(400, LOAN_APPLICATION_MESSAGES.INVALID_AMOUNT);
      }

      if (
        Number(data.tenure) < Number(loanProduct.minimum_tenure) ||
        Number(data.tenure) > Number(loanProduct.maximum_tenure)
      ) {
        throw new ApiError(400, LOAN_APPLICATION_MESSAGES.INVALID_TENURE);
      }

      const lastApplication =
        await loanApplicationRepository.getLastApplicationNumber();

      const applicationNumber = CodeGenerator.generate(
        LOAN_APPLICATION.PREFIX,
        lastApplication?.application_number,
        LOAN_APPLICATION.PAD_LENGTH,
      );

      const applicationId = await loanApplicationRepository.create(connection, {
        applicationNumber,

        customerId: data.customerId,

        groupId: data.groupId || null,

        loanProductId: data.loanProductId,

        requestedAmount: data.requestedAmount,

        approvedAmount: null,

        tenure: data.tenure,

        interestRate: loanProduct.interest_rate,

        purpose: data.purpose || null,

        remarks: data.remarks || null,

        applicationStatus: LOAN_APPLICATION_STATUS.PENDING,

        appliedBy: currentUser.user_id,
      });

      await loanApplicationRepository.commit(connection);

      return {
        applicationId,
        applicationNumber,
      };
    } catch (error) {
      await loanApplicationRepository.rollback(connection);

      throw error;
    }
  }

  async getLoanApplications(query) {
    const { page, limit } = PaginationHelper.build(query);

    const filters = {
      page,

      limit,

      search: query.search?.trim() || null,

      customerId: query.customerId || null,

      groupId: query.groupId || null,

      loanProductId: query.loanProductId || null,

      status: query.status || null,

      fromDate: query.fromDate || null,

      toDate: query.toDate || null,

      sortBy: query.sortBy || "created_at",

      sortOrder: query.sortOrder || "DESC",
    };

    const loanApplications = await loanApplicationRepository.findAll(filters);

    const totalRecords = await loanApplicationRepository.count(filters);

    return {
      loanApplications,

      pagination: PaginationHelper.metadata(page, limit, totalRecords),
    };
  }
  async getLoanApplicationById(id) {
    const loanApplication = await loanApplicationRepository.findById(id);

    if (!loanApplication) {
      throw new ApiError(404, LOAN_APPLICATION_MESSAGES.NOT_FOUND);
    }

    return loanApplication;
  }

  async updateLoanApplication(id, data, currentUser) {
    const connection = await loanApplicationRepository.beginTransaction();

    try {
      const application = await loanApplicationRepository.findById(id);

      if (!application) {
        throw new ApiError(404, LOAN_APPLICATION_MESSAGES.NOT_FOUND);
      }

      if (
        ![
          LOAN_APPLICATION_STATUS.DRAFT,
          LOAN_APPLICATION_STATUS.PENDING,
        ].includes(application.application_status)
      ) {
        throw new ApiError(400, LOAN_APPLICATION_MESSAGES.UPDATE_NOT_ALLOWED);
      }

      const customer = await loanApplicationRepository.findCustomer(
        data.customerId,
      );

      if (!customer) {
        throw new ApiError(404, LOAN_APPLICATION_MESSAGES.CUSTOMER_NOT_FOUND);
      }

      if (customer.status !== "ACTIVE") {
        throw new ApiError(400, LOAN_APPLICATION_MESSAGES.CUSTOMER_INACTIVE);
      }

      if (data.groupId) {
        const group = await loanApplicationRepository.findGroup(data.groupId);

        if (!group) {
          throw new ApiError(404, LOAN_APPLICATION_MESSAGES.GROUP_NOT_FOUND);
        }

        if (group.status !== "ACTIVE") {
          throw new ApiError(400, LOAN_APPLICATION_MESSAGES.GROUP_INACTIVE);
        }
      }

      const loanProduct = await loanApplicationRepository.findLoanProduct(
        data.loanProductId,
      );

      if (!loanProduct) {
        throw new ApiError(
          404,
          LOAN_APPLICATION_MESSAGES.LOAN_PRODUCT_NOT_FOUND,
        );
      }

      if (
        Number(data.requestedAmount) < Number(loanProduct.minimum_amount) ||
        Number(data.requestedAmount) > Number(loanProduct.maximum_amount)
      ) {
        throw new ApiError(400, LOAN_APPLICATION_MESSAGES.INVALID_AMOUNT);
      }

      if (
        Number(data.tenure) < Number(loanProduct.minimum_tenure) ||
        Number(data.tenure) > Number(loanProduct.maximum_tenure)
      ) {
        throw new ApiError(400, LOAN_APPLICATION_MESSAGES.INVALID_TENURE);
      }

      await loanApplicationRepository.update(connection, {
        applicationId: id,

        customerId: data.customerId,

        groupId: data.groupId || null,

        loanProductId: data.loanProductId,

        requestedAmount: data.requestedAmount,

        tenure: data.tenure,

        interestRate: loanProduct.interest_rate,

        purpose: data.purpose || null,

        remarks: data.remarks || null,
      });

      await loanApplicationRepository.commit(connection);
    } catch (error) {
      await loanApplicationRepository.rollback(connection);

      throw error;
    }
  }

  async updateStatus(id, status) {
    const connection = await loanApplicationRepository.beginTransaction();

    try {
      const application = await loanApplicationRepository.findById(id);

      if (!application) {
        throw new ApiError(404, LOAN_APPLICATION_MESSAGES.NOT_FOUND);
      }

      await loanApplicationRepository.updateStatus(connection, id, status);

      await loanApplicationRepository.commit(connection);
    } catch (error) {
      await loanApplicationRepository.rollback(connection);

      throw error;
    }
  }
  async verifyApplication(id, currentUser) {
    const connection = await loanApplicationRepository.beginTransaction();

    try {
      const application = await loanApplicationRepository.findById(id);

      if (!application) {
        throw new ApiError(404, LOAN_APPLICATION_MESSAGES.NOT_FOUND);
      }

      if (
        application.application_status !== LOAN_APPLICATION_STATUS.UNDER_REVIEW
      ) {
        throw new ApiError(400, LOAN_APPLICATION_MESSAGES.INVALID_STATUS);
      }

      await loanApplicationRepository.updateVerification(
        connection,
        id,
        currentUser.user_id,
      );

      await loanApplicationRepository.commit(connection);
    } catch (error) {
      await loanApplicationRepository.rollback(connection);

      throw error;
    }
  }

  async approveApplication(id, approvedAmount, currentUser) {
    const connection = await loanApplicationRepository.beginTransaction();

    try {
      const application = await loanApplicationRepository.findById(id);

      if (!application) {
        throw new ApiError(404, LOAN_APPLICATION_MESSAGES.NOT_FOUND);
      }

      if (application.application_status !== LOAN_APPLICATION_STATUS.VERIFIED) {
        throw new ApiError(400, LOAN_APPLICATION_MESSAGES.INVALID_STATUS);
      }

      await loanApplicationRepository.updateApproval(
        connection,
        id,
        approvedAmount,
        currentUser.user_id,
      );

      await loanApplicationRepository.commit(connection);
    } catch (error) {
      await loanApplicationRepository.rollback(connection);

      throw error;
    }
  }

  async rejectApplication(id, reason, currentUser) {
    const connection = await loanApplicationRepository.beginTransaction();

    try {
      const application = await loanApplicationRepository.findById(id);

      if (!application) {
        throw new ApiError(404, LOAN_APPLICATION_MESSAGES.NOT_FOUND);
      }

      if (
        [
          LOAN_APPLICATION_STATUS.APPROVED,
          LOAN_APPLICATION_STATUS.DISBURSED,
          LOAN_APPLICATION_STATUS.REJECTED,
        ].includes(application.application_status)
      ) {
        throw new ApiError(400, LOAN_APPLICATION_MESSAGES.INVALID_STATUS);
      }

      await loanApplicationRepository.reject(
        connection,
        id,
        reason,
        currentUser.user_id,
      );

      await loanApplicationRepository.commit(connection);
    } catch (error) {
      await loanApplicationRepository.rollback(connection);

      throw error;
    }
  }

  async disburseApplication(id) {
    const connection = await loanApplicationRepository.beginTransaction();

    try {
      const application = await loanApplicationRepository.findById(id);

      if (!application) {
        throw new ApiError(404, LOAN_APPLICATION_MESSAGES.NOT_FOUND);
      }

      if (application.application_status !== LOAN_APPLICATION_STATUS.APPROVED) {
        throw new ApiError(400, LOAN_APPLICATION_MESSAGES.INVALID_STATUS);
      }

      await loanApplicationRepository.updateDisbursement(connection, id);

      await loanApplicationRepository.commit(connection);
    } catch (error) {
      await loanApplicationRepository.rollback(connection);

      throw error;
    }
  }

  async deleteLoanApplication(id) {
    const connection = await loanApplicationRepository.beginTransaction();

    try {
      const application = await loanApplicationRepository.findById(id);

      if (!application) {
        throw new ApiError(404, LOAN_APPLICATION_MESSAGES.NOT_FOUND);
      }

      if (
        ![
          LOAN_APPLICATION_STATUS.DRAFT,
          LOAN_APPLICATION_STATUS.PENDING,
        ].includes(application.application_status)
      ) {
        throw new ApiError(400, LOAN_APPLICATION_MESSAGES.DELETE_NOT_ALLOWED);
      }

      await loanApplicationRepository.softDelete(connection, id);

      await loanApplicationRepository.commit(connection);
    } catch (error) {
      await loanApplicationRepository.rollback(connection);

      throw error;
    }
  }
}

export default new LoanApplicationService();
