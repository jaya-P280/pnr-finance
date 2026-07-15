import customerService from "./customer.service.js";
import ApiResponse from "../../shared/ApiResponse.js";
import { CUSTOMER_MESSAGES } from "./customers.constants.js";

class CustomerController {

    async createCustomer(req, res, next) {

        try {

            const result = await customerService.createCustomer(
                req.body,
                req.user
            );

            return res.status(201).json(
                new ApiResponse(
                    201,
                    result,
                    "Customer created successfully."
                )
            );

        } catch (error) {

            next(error);

        }

    }

    async getCustomers(req, res, next) {

        try {

            const result = await customerService.getCustomers(
                req.query
            );

            return res.status(200).json(
                new ApiResponse(
                    200,
                    result,
                    "Customers fetched successfully."
                )
            );

        } catch (error) {

            next(error);

        }

    }

    async getCustomerById(req, res, next) {

        try {

            const result = await customerService.getCustomerById(
                Number(req.params.id)
            );

            return res.status(200).json(
                new ApiResponse(
                    200,
                    result,
                    "Customer fetched successfully."
                )
            );

        } catch (error) {

            next(error);

        }

    }

    async updateCustomer(req, res, next) {

        try {

            await customerService.updateCustomer(

                Number(req.params.id),

                req.body,

                req.user

            );

            return res.status(200).json(

                new ApiResponse(
                    200,
                    null,
                    CUSTOMER_MESSAGES.UPDATED
                )

            );

        } catch (error) {

            next(error);

        }

    }

    async updateCustomerStatus(req, res, next) {

        try {

            await customerService.updateCustomerStatus(

                Number(req.params.id),

                req.body.status,

                req.user

            );

            return res.status(200).json(

                new ApiResponse(
                    200,
                    null,
                    CUSTOMER_MESSAGES.STATUS_UPDATED
                )

            );

        } catch (error) {

            next(error);

        }

    }

    async deleteCustomer(req, res, next) {

        try {

            await customerService.deleteCustomer(

                Number(req.params.id),

                req.user

            );

            return res.status(200).json(

                new ApiResponse(
                    200,
                    null,
                    CUSTOMER_MESSAGES.DELETED
                )

            );

        } catch (error) {

            next(error);

        }

    }

}

export default new CustomerController();