import express from "express";

import customerController from "./customer.controller.js";

import {
    createCustomerValidation,
    getCustomerValidation,
    updateCustomerValidation,
    updateCustomerStatusValidation,
    deleteCustomerValidation
} from "./customer.validation.js";

import authMiddleware from "../auth/auth.middleware.js";
import authorize from "../../middleware/authorize.middleware.js";
import validationMiddleware from "../../middleware/validation.middleware.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    authorize("CUSTOMER_CREATE"),
    createCustomerValidation,
    validationMiddleware,
    customerController.createCustomer
);

router.get(
    "/",
    authMiddleware,
    customerController.getCustomers
);

router.get(
    "/:id",
    authMiddleware,
    getCustomerValidation,
    validationMiddleware,
    customerController.getCustomerById
);

router.put(
    "/:id",
    authMiddleware,
    authorize("CUSTOMER_UPDATE"),
    updateCustomerValidation,
    validationMiddleware,
    customerController.updateCustomer
);

router.patch(
    "/:id/status",
    authMiddleware,
    authorize("CUSTOMER_UPDATE"),
    updateCustomerStatusValidation,
    validationMiddleware,
    customerController.updateCustomerStatus
);

router.delete(
    "/:id",
    authMiddleware,
    authorize("CUSTOMER_DELETE"),
    deleteCustomerValidation,
    validationMiddleware,
    customerController.deleteCustomer
);

export default router;