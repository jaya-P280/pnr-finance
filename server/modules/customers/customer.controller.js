import ApiResponse from "../../shared/ApiResponse.js";
import customerService from "./customer.service.js";
import { getBase64Image } from "../../shared/imageUrl.helper.js";

class CustomerController {
  async createCustomer(req, res, next) {
    try {
      const result = await customerService.createCustomer(
        req.body,
        req.user,
      );
      return res
        .status(201)
        .json(
          new ApiResponse(201, "Customer created successfully.", result),
        );
    } catch (error) {
      next(error);
    }
  }

  async getCustomers(req, res, next) {
    try {
      const result = await customerService.getCustomers(req.query);
      if (result?.customers) {
        result.customers = result.customers.map((c) => ({
          ...c,
          profile_image_base64: getBase64Image(c.profile_image, "profiles"),
        }));
      }
      return res
        .status(200)
        .json(new ApiResponse(200, "Customers fetched successfully.", result));
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req, res, next) {
    try {
      const result = await customerService.getCustomerById(
        Number(req.params.id),
      );
      if (result) {
        result.profile_image_base64 = getBase64Image(
          result.profile_image,
          "profiles",
        );
      }
      return res
        .status(200)
        .json(new ApiResponse(200, "Customer fetched successfully.", result));
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req, res, next) {
    try {
      await customerService.updateCustomer(
        Number(req.params.id),
        req.body,
        req.user,
      );
      return res
        .status(200)
        .json(new ApiResponse(200, "Customer updated successfully."));
    } catch (error) {
      next(error);
    }
  }

  async updateCustomerStatus(req, res, next) {
    try {
      await customerService.updateCustomerStatus(
        Number(req.params.id),
        req.body.status,
        req.user,
      );
      return res
        .status(200)
        .json(new ApiResponse(200, "Customer status updated successfully."));
    } catch (error) {
      next(error);
    }
  }

  async deleteCustomer(req, res, next) {
    try {
      await customerService.deleteCustomer(Number(req.params.id), req.user);
      return res
        .status(200)
        .json(new ApiResponse(200, "Customer deleted successfully."));
    } catch (error) {
      next(error);
    }
  }

  async uploadCustomerKyc(req, res, next) {
    try {
      const result = await customerService.uploadCustomerKyc(
        Number(req.params.id),
        req.files,
        req.body,
        req.user,
        {
          ipAddress: req.ip,
          userAgent: req.get("user-agent"),
        },
      );
      return res
        .status(200)
        .json(
          new ApiResponse(200, "Customer KYC uploaded successfully.", result),
        );
    } catch (error) {
      next(error);
    }
  }

  async verifyCustomerKyc(req, res, next) {
    try {
      await customerService.verifyCustomerKyc(Number(req.params.id), req.user);
      return res
        .status(200)
        .json(new ApiResponse(200, "Customer KYC verified successfully."));
    } catch (error) {
      next(error);
    }
  }

  async rejectCustomerKyc(req, res, next) {
    try {
      await customerService.rejectCustomerKyc(
        Number(req.params.id),
        req.body.remarks,
        req.user,
      );
      return res
        .status(200)
        .json(new ApiResponse(200, "Customer KYC rejected successfully."));
    } catch (error) {
      next(error);
    }
  }

  async uploadProfileImage(req, res, next) {
    try {
      const result = await customerService.updateProfileImage(
        Number(req.params.id),
        req.file,
        req.user,
      );
      const imgData = getBase64Image(result.profileImage, "profiles");
      return res.json(
        new ApiResponse(200, "Profile image updated successfully.", {
          profileImage: result.profileImage,
          imgData,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  async getCustomerProfile(req, res, next) {
    try {
      const profile = await customerService.getCustomerProfile(
        Number(req.params.id),
      );
      if (profile?.customer) {
        profile.customer.profile_image_base64 = getBase64Image(
          profile.customer.profile_image,
          "profiles",
        );
      }
      return res.json(
        new ApiResponse(200, "Customer profile fetched successfully.", profile),
      );
    } catch (error) {
      next(error);
    }
  }

  async getKycQueue(req, res, next) {
    try {
      const result = await customerService.getKycQueue(req.query);
      if (result?.rows) {
        result.rows = result.rows.map((row) => ({
          ...row,
          profile_image_base64: getBase64Image(row.profile_image, "profiles"),
        }));
      }
      return res.json(
        new ApiResponse(200, "KYC queue fetched successfully.", result),
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();
