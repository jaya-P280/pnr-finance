import ApiError from "../../shared/ApiError.js";
import logger from "../../config/logger.js";
import branchRepository from "./branch.repository.js";
import { BRANCH, BRANCH_MESSAGES } from "./branch.constants.js";
import auditService from "../audit/audit.service.js";

class BranchService {
  generateBranchCode(lastBranchCode) {

    if (!lastBranchCode) {
        return `${BRANCH.PREFIX}${String(1).padStart(
            BRANCH.PAD_LENGTH,
            "0"
        )}`;
    }

    console.log("Previous Branch Code:", lastBranchCode);

    const number = parseInt(
        String(lastBranchCode).replace(/\D/g, ""),
        10
    );

    if (Number.isNaN(number)) {
        throw new Error(
            `Invalid branch code found in database: ${lastBranchCode}`
        );
    }

    return `${BRANCH.PREFIX}${String(number + 1).padStart(
        BRANCH.PAD_LENGTH,
        "0"
    )}`;
}

  async createBranch(data, currentUser) {
    const connection = await branchRepository.beginTransaction();

    try {
      const email = await branchRepository.existsByEmail(
        connection,
        data.email,
      );

      if (email) {
        throw new ApiError(409, BRANCH_MESSAGES.EMAIL_EXISTS);
      }

      const phone = await branchRepository.existsByPhone(
        connection,
        data.phone,
      );

      if (phone) {
        throw new ApiError(409, BRANCH_MESSAGES.PHONE_EXISTS);
      }

      const lastBranch = await branchRepository.getLastBranchCode();

      const branchCode = this.generateBranchCode(lastBranch?.branch_code);

      const branchId = await branchRepository.createBranch(connection, {
        branchCode,
        branchName: data.branchName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        createdBy: currentUser.user_id,
      });

      await branchRepository.commit(connection);

      logger.info(`Branch Created : ${branchCode}`);

      return {
        branchId,

        branchCode,
      };
    } catch (error) {
      await branchRepository.rollback(connection);

      throw error;
    }
  }

  async getBranches(query) {
    const page = Number(query.page) || 1;

    const limit = Number(query.limit) || 10;

    const filters = {
      page,

      limit,

      search: query.search?.trim() || null,

      status: query.status || null,

      sortBy: query.sortBy || "created_at",

      sortOrder: query.sortOrder || "DESC",
    };

    const branches = await branchRepository.getBranches(filters);

    const totalRecords = await branchRepository.countBranches(filters);

    return {
      branches,

      pagination: {
        page,

        limit,

        totalRecords,

        totalPages: Math.ceil(totalRecords / limit),

        hasNext: page < Math.ceil(totalRecords / limit),

        hasPrevious: page > 1,
      },
    };
  }

  async getBranchById(branchId) {
    const branch = await branchRepository.getBranchById(branchId);

    if (!branch) {
      throw new ApiError(404, BRANCH_MESSAGES.NOT_FOUND);
    }

    return branch;
  }

  async updateBranch(branchId, data, currentUser) {
    const connection = await branchRepository.beginTransaction();

    try {
      const existingBranch = await branchRepository.getBranchById(branchId);

      if (!existingBranch) {
        throw new ApiError(404, BRANCH_MESSAGES.NOT_FOUND);
      }

      const email = await branchRepository.findByEmail(data.email);

      if (email && email.branch_id !== branchId) {
        throw new ApiError(409, BRANCH_MESSAGES.EMAIL_EXISTS);
      }

      const phone = await branchRepository.findByPhone(data.phone);

      if (phone && phone.branch_id !== branchId) {
        throw new ApiError(409, BRANCH_MESSAGES.PHONE_EXISTS);
      }

      await branchRepository.updateBranch(connection, {
        branchId,
        branchName: data.branchName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        updatedBy: currentUser.user_id,
      });

      await branchRepository.commit(connection);
    } catch (error) {
      await branchRepository.rollback(connection);

      throw error;
    }
  }

  async updateBranchStatus(branchId, status, currentUser) {
    const connection = await branchRepository.beginTransaction();

    try {
      const branch = await branchRepository.getBranchById(branchId);

      if (!branch) {
        throw new ApiError(404, BRANCH_MESSAGES.NOT_FOUND);
      }

      if (branch.status === status) {
        throw new ApiError(400, `Branch is already ${status}.`);
      }

      await branchRepository.updateBranchStatus(
        connection,
        branchId,
        status,
        currentUser.user_id,
      );

      await branchRepository.commit(connection);
    } catch (error) {
      await branchRepository.rollback(connection);

      throw error;
    }
  }

  async deleteBranch(branchId, currentUser) {
    const connection = await branchRepository.beginTransaction();

    try {
      const branch = await branchRepository.getBranchById(branchId);

      if (!branch) {
        throw new ApiError(404, BRANCH_MESSAGES.NOT_FOUND);
      }

      await branchRepository.softDeleteBranch(
        connection,
        branchId,
        currentUser.user_id,
      );

      await branchRepository.commit(connection);
    } catch (error) {
      await branchRepository.rollback(connection);

      throw error;
    }
  }
}

export default new BranchService();
