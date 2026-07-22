import ApiError from "../../shared/ApiError.js";
import logger from "../../config/logger.js";
import customerRepository from "./customer.repository.js";
import { CUSTOMER_MESSAGES, CUSTOMER } from "./customers.constants.js";
import CodeGenerator from "../../shared/codeGenerator.helper.js";
import PaginationHelper from "../../shared/pagination.helper.js";

class CustomerService {
  
  async createCustomer(data, currentUser) {
    const connection = await customerRepository.beginTransaction();

    try {
      const branch = await customerRepository.branchExists(
        connection,
        data.branchId,
      );

      if (!branch) {
        throw new ApiError(404, CUSTOMER_MESSAGES.BRANCH_NOT_FOUND);
      }

      if (
        await customerRepository.mobileExists(connection, data.mobileNumber)
      ) {
        throw new ApiError(409, CUSTOMER_MESSAGES.MOBILE_EXISTS);
      }

      if (await customerRepository.emailExists(connection, data.email)) {
        throw new ApiError(409, CUSTOMER_MESSAGES.EMAIL_EXISTS);
      }

      if (
        await customerRepository.aadhaarExists(connection, data.aadhaarNumber)
      ) {
        throw new ApiError(409, CUSTOMER_MESSAGES.AADHAAR_EXISTS);
      }

      if (await customerRepository.panExists(connection, data.panNumber)) {
        throw new ApiError(409, CUSTOMER_MESSAGES.PAN_EXISTS);
      }

      const lastCustomer =
        await customerRepository.getLastCustomerCode(connection);

      const customerCode = CodeGenerator(CUSTOMER.PREFIX,lastCustomer?.customer_code,CUSTOMER.PAD_LENGTH);

      const customerId = await customerRepository.createCustomer(connection, {
        customerCode,
        branchId: data.branchId,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        mobileNumber: data.mobileNumber,
        alternateMobile: data.alternateMobile ?? null,
        email: data.email ?? null,
        aadhaarNumber: data.aadhaarNumber ?? null,
        panNumber: data.panNumber ?? null,
        occupation: data.occupation ?? null,
        monthlyIncome: data.monthlyIncome ?? null,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        createdBy: currentUser.user_id,
      });

      await customerRepository.commit(connection);

      logger.info(`Customer Created : ${customerCode}`);

      return {
        customerId,

        customerCode,
      };
    } catch (error) {
      await customerRepository.rollback(connection);

      throw error;
    }
  }

  async getCustomers(query) {
    const {page, limit} = PaginationHelper.build(query);

    const filters = {
      page,

      limit,

      search: query.search?.trim() || null,

      branchId: query.branchId ? Number(query.branchId) : null,

      status: query.status || null,

      sortBy: query.sortBy || "created_at",

      sortOrder: query.sortOrder || "ASC",
    };

    const customers = await customerRepository.getCustomers(filters);

    const totalRecords = await customerRepository.countCustomers(filters);

    return {
      customers,

      pagination: PaginationHelper.metadata(page,limit,totalRecords),
    };
  }

  async getCustomerById(customerId) {
    const customer = await customerRepository.getCustomerById(customerId);

    if (!customer) {
      throw new ApiError(404, CUSTOMER_MESSAGES.NOT_FOUND);
    }

    return customer;
  }

  async updateCustomer(customerId, data, currentUser) {
    const connection = await customerRepository.beginTransaction();

    try {
      const customer = await customerRepository.getCustomerById(customerId);

      if (!customer) {
        throw new ApiError(404, CUSTOMER_MESSAGES.NOT_FOUND);
      }

      const branch = await customerRepository.branchExists(
        connection,
        data.branchId,
      );

      if (!branch) {
        throw new ApiError(404, CUSTOMER_MESSAGES.BRANCH_NOT_FOUND);
      }

      const mobile = await customerRepository.findByMobile(data.mobileNumber);

      if (mobile && mobile.customer_id !== customerId) {
        throw new ApiError(409, CUSTOMER_MESSAGES.MOBILE_EXISTS);
      }

      const email = await customerRepository.findByEmail(data.email);

      if (email && email.customer_id !== customerId) {
        throw new ApiError(409, CUSTOMER_MESSAGES.EMAIL_EXISTS);
      }

      const aadhaar = await customerRepository.findByAadhaar(
        data.aadhaarNumber,
      );

      if (aadhaar && aadhaar.customer_id !== customerId) {
        throw new ApiError(409, CUSTOMER_MESSAGES.AADHAAR_EXISTS);
      }

      const pan = await customerRepository.findByPan(data.panNumber);

      if (pan && pan.customer_id !== customerId) {
        throw new ApiError(409, CUSTOMER_MESSAGES.PAN_EXISTS);
      }

      const existingCustomer =
        await customerRepository.getCustomerById(customerId);
      // ...
      await customerRepository.updateCustomer(connection, {
        customerId,
        branchId: data.branchId,
        firstName: data.firstName,
        lastName: data.lastName ?? existingCustomer.last_name ?? null,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth,
        mobileNumber: data.mobileNumber,
        alternateMobile:
          data.alternateMobile ?? existingCustomer.alternate_mobile ?? null,
        email: data.email ?? existingCustomer.email ?? null,
        aadhaarNumber:
          data.aadhaarNumber ?? existingCustomer.aadhaar_number ?? null,
        panNumber: data.panNumber ?? existingCustomer.pan_number ?? null,
        occupation: data.occupation ?? existingCustomer.occupation ?? null,
        monthlyIncome:
          data.monthlyIncome ?? existingCustomer.monthly_income ?? null,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        updatedBy: currentUser.user_id,
      });

      await customerRepository.commit(connection);
    } catch (error) {
      await customerRepository.rollback(connection);

      throw error;
    }
  }

  async updateCustomerStatus(customerId, status, currentUser) {
    const connection = await customerRepository.beginTransaction();

    try {
      const customer = await customerRepository.getCustomerById(customerId);

      if (!customer) {
        throw new ApiError(404, CUSTOMER_MESSAGES.NOT_FOUND);
      }

      if (customer.status === status) {
        throw new ApiError(400, `Customer is already ${status}.`);
      }

      await customerRepository.updateCustomerStatus(
        connection,
        customerId,
        status,
        currentUser.user_id,
      );

      await customerRepository.commit(connection);
    } catch (error) {
      await customerRepository.rollback(connection);

      throw error;
    }
  }

  async deleteCustomer(customerId, currentUser) {
    const connection = await customerRepository.beginTransaction();

    try {
      const customer = await customerRepository.getCustomerById(customerId);

      if (!customer) {
        throw new ApiError(404, CUSTOMER_MESSAGES.NOT_FOUND);
      }

      await customerRepository.softDeleteCustomer(
        connection,
        customerId,
        currentUser.user_id,
      );

      await customerRepository.commit(connection);
    } catch (error) {
      await customerRepository.rollback(connection);

      throw error;
    }
  }
}

export default new CustomerService();
