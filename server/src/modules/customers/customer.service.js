import ApiError from "../../shared/ApiError.js";
import logger from "../../config/logger.js";
import customerRepository from "./customer.repository.js";
import { CUSTOMER_MESSAGES, CUSTOMER } from "./customers.constants.js";

class CustomerService {

    generateCustomerCode(lastCustomerCode) {

        if (!lastCustomerCode) {

            return `${CUSTOMER.PREFIX}${String(1).padStart(
                CUSTOMER.PAD_LENGTH,
                "0"
            )}`;

        }

        const number = Number(
            lastCustomerCode.replace(
                CUSTOMER.PREFIX,
                ""
            )
        );

        return `${CUSTOMER.PREFIX}${String(number + 1).padStart(
            CUSTOMER.PAD_LENGTH,
            "0"
        )}`;

    }

    async createCustomer(data, currentUser) {

        const connection =
            await customerRepository.beginTransaction();

        try {

            const branch =
                await customerRepository.branchExists(
                    connection,
                    data.branchId
                );

            if (!branch) {

                throw new ApiError(
                    404,
                    CUSTOMER_MESSAGES.BRANCH_NOT_FOUND
                );

            }

            if (
                await customerRepository.mobileExists(
                    connection,
                    data.mobileNumber
                )
            ) {

                throw new ApiError(
                    409,
                    CUSTOMER_MESSAGES.MOBILE_EXISTS
                );

            }

            if (
                await customerRepository.emailExists(
                    connection,
                    data.email
                )
            ) {

                throw new ApiError(
                    409,
                    CUSTOMER_MESSAGES.EMAIL_EXISTS
                );

            }

            if (
                await customerRepository.aadhaarExists(
                    connection,
                    data.aadhaarNumber
                )
            ) {

                throw new ApiError(
                    409,
                    CUSTOMER_MESSAGES.AADHAAR_EXISTS
                );

            }

            if (
                await customerRepository.panExists(
                    connection,
                    data.panNumber
                )
            ) {

                throw new ApiError(
                    409,
                    CUSTOMER_MESSAGES.PAN_EXISTS
                );

            }

            const lastCustomer =
                await customerRepository.getLastCustomerCode(
                    connection
                );

            const customerCode =
                this.generateCustomerCode(
                    lastCustomer?.customer_code
                );

            const customerId =
                await customerRepository.createCustomer(
                    connection,
                    {
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
                        createdBy: currentUser.user_id
                    }
                );

            await customerRepository.commit(connection);

            logger.info(
                `Customer Created : ${customerCode}`
            );

            return {

                customerId,

                customerCode

            };

        }
        catch (error) {

            await customerRepository.rollback(connection);

            throw error;

        }

    }

    async getCustomers(query) {

        const page =
            Number(query.page) || 1;

        const limit =
            Number(query.limit) || 10;

        const filters = {

            page,

            limit,

            search: query.search?.trim() || null,

            branchId: query.branchId
                ? Number(query.branchId)
                : null,

            status: query.status || null,

            sortBy: query.sortBy || "created_at",

            sortOrder: query.sortOrder || "DESC"

        };

        const customers =
            await customerRepository.getCustomers(
                filters
            );

        const totalRecords =
            await customerRepository.countCustomers(
                filters
            );

        return {

            customers,

            pagination: {

                page,

                limit,

                totalRecords,

                totalPages: Math.ceil(
                    totalRecords / limit
                ),

                hasNext:
                    page <
                    Math.ceil(totalRecords / limit),

                hasPrevious:
                    page > 1

            }

        };

    }

    async getCustomerById(customerId) {

        const customer =
            await customerRepository.getCustomerById(
                customerId
            );

        if (!customer) {

            throw new ApiError(
                404,
                CUSTOMER_MESSAGES.NOT_FOUND
            );

        }

        return customer;

    }

    async updateCustomer(customerId, data, currentUser) {

        const connection = await customerRepository.beginTransaction();

        try {

            const customer =
                await customerRepository.getCustomerById(customerId);

            if (!customer) {

                throw new ApiError(
                    404,
                    CUSTOMER_MESSAGES.NOT_FOUND
                );

            }

            const branch =
                await customerRepository.branchExists(
                    connection,
                    data.branchId
                );

            if (!branch) {

                throw new ApiError(
                    404,
                    CUSTOMER_MESSAGES.BRANCH_NOT_FOUND
                );

            }

            const mobile =
                await customerRepository.findByMobile(
                    data.mobileNumber
                );

            if (
                mobile &&
                mobile.customer_id !== customerId
            ) {

                throw new ApiError(
                    409,
                    CUSTOMER_MESSAGES.MOBILE_EXISTS
                );

            }

            const email =
                await customerRepository.findByEmail(
                    data.email
                );

            if (
                email &&
                email.customer_id !== customerId
            ) {

                throw new ApiError(
                    409,
                    CUSTOMER_MESSAGES.EMAIL_EXISTS
                );

            }

            const aadhaar =
                await customerRepository.findByAadhaar(
                    data.aadhaarNumber
                );

            if (
                aadhaar &&
                aadhaar.customer_id !== customerId
            ) {

                throw new ApiError(
                    409,
                    CUSTOMER_MESSAGES.AADHAAR_EXISTS
                );

            }

            const pan =
                await customerRepository.findByPan(
                    data.panNumber
                );

            if (
                pan &&
                pan.customer_id !== customerId
            ) {

                throw new ApiError(
                    409,
                    CUSTOMER_MESSAGES.PAN_EXISTS
                );

            }

            await customerRepository.updateCustomer(
                connection,
                {
                    customerId,
                    ...data,
                    updatedBy: currentUser.user_id
                }
            );

            await customerRepository.commit(connection);

        } catch (error) {

            await customerRepository.rollback(connection);

            throw error;

        }

    }

    async updateCustomerStatus(
        customerId,
        status,
        currentUser
    ) {

        const connection =
            await customerRepository.beginTransaction();

        try {

            const customer =
                await customerRepository.getCustomerById(customerId);

            if (!customer) {

                throw new ApiError(
                    404,
                    CUSTOMER_MESSAGES.NOT_FOUND
                );

            }

            if (customer.status === status) {

                throw new ApiError(
                    400,
                    `Customer is already ${status}.`
                );

            }

            await customerRepository.updateCustomerStatus(
                connection,
                customerId,
                status,
                currentUser.user_id
            );

            await customerRepository.commit(connection);

        } catch (error) {

            await customerRepository.rollback(connection);

            throw error;

        }

    }

    async deleteCustomer(
        customerId,
        currentUser
    ) {

        const connection =
            await customerRepository.beginTransaction();

        try {

            const customer =
                await customerRepository.getCustomerById(customerId);

            if (!customer) {

                throw new ApiError(
                    404,
                    CUSTOMER_MESSAGES.NOT_FOUND
                );

            }

            await customerRepository.softDeleteCustomer(
                connection,
                customerId,
                currentUser.user_id
            );

            await customerRepository.commit(connection);

        } catch (error) {

            await customerRepository.rollback(connection);

            throw error;

        }

    }

}

export default new CustomerService();