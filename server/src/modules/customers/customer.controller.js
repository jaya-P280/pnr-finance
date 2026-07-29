import customerService from "./customer.service.js";
import ApiResponse from "../../shared/ApiResponse.js";
import { CUSTOMER_MESSAGES } from "./customers.constants.js";
import ApiError from "../../shared/ApiError.js";

class CustomerController {
  async createCustomer(req, res, next) {
    try {
      const result = await customerService.createCustomer(req.body, req.user);
      return res
        .status(201)
        .json(new ApiResponse(201, "Customer created successfully.", result));
    } catch (error) {
      next(error);
    }
  }

  async getCustomers(req, res, next) {
    try {
      const result = await customerService.getCustomers(req.query);
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
        .json(new ApiResponse(200, CUSTOMER_MESSAGES.UPDATED));
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
        .json(new ApiResponse(200, CUSTOMER_MESSAGES.STATUS_UPDATED));
    } catch (error) {
      next(error);
    }
  }

  async deleteCustomer(req, res, next) {
    try {
      await customerService.deleteCustomer(Number(req.params.id), req.user);
      return res
        .status(200)
        .json(new ApiResponse(200, CUSTOMER_MESSAGES.DELETED));
    } catch (error) {
      next(error);
    }
  }

  async uploadCustomerKyc(req, res, next) {
    try {
      const files = req.files;
      console.log(req.files);
      if (!files?.aadhaarFront && !files?.aadhaarBack && !files?.panImage) {
        throw new ApiError(400, "Please upload at least one KYC document.");
      }
      const result = await customerService.uploadCustomerKyc(
        Number(req.params.id),
        files,
        req.body,
        req.user,
        { ipAddress: req.ip, userAgent: req.get("User-Agent") },
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

  async addFamilyMember(req, res, next) {
    try {
      await customerService.addFamilyMember(Number(req.params.id), req.body);
      return res
        .status(201)
        .json(new ApiResponse(201, "Family member added successfully."));
    } catch (error) {
      next(error);
    }
  }

  async getFamilyMembers(req, res, next) {
    try {
      const familyMembers = await customerService.getFamilyMembers(
        Number(req.params.id),
      );
      return res.json(
        new ApiResponse(
          200,
          "Family members fetched successfully.",
          familyMembers,
        ),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateFamilyMember(req, res, next) {
    try {
      await customerService.updateFamilyMember(
        Number(req.params.familyId),
        req.body,
      );
      return res.json(
        new ApiResponse(200, "Family member updated successfully."),
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteFamilyMember(req, res, next) {
    try {
      await customerService.deleteFamilyMember(Number(req.params.familyId));
      return res.json(
        new ApiResponse(200, "Family member deleted successfully."),
      );
    } catch (error) {
      next(error);
    }
  }

  async addNominee(req, res, next) {
    try {
      await customerService.addNominee(Number(req.params.id), req.body);
      return res
        .status(201)
        .json(new ApiResponse(201, "Nominee added successfully."));
    } catch (error) {
      next(error);
    }
  }

  async getNominees(req, res, next) {
    try {
      const nominees = await customerService.getNominees(Number(req.params.id));
      return res.json(
        new ApiResponse(200, "Nominees fetched successfully.", nominees),
      );
    } catch (error) {
      next(error);
    }
  }

  async updateNominee(req, res, next) {
    try {
      await customerService.updateNominee(
        Number(req.params.nomineeId),
        req.body,
      );
      return res.json(new ApiResponse(200, "Nominee updated successfully."));
    } catch (error) {
      next(error);
    }
  }

  async deleteNominee(req, res, next) {
    try {
      await customerService.deleteNominee(Number(req.params.nomineeId));
      return res.json(new ApiResponse(200, "Nominee deleted successfully."));
    } catch (error) {
      next(error);
    }
  }

  async getCustomerProfile(req, res, next) {
    try {
      const profile = await customerService.getCustomerProfile(
        Number(req.params.id),
      );
      if (profile.kyc) {
        profile.kyc.aadhaar_front = getFullImageUrl(
          req,
          profile.kyc.aadhaar_front,
          "kyc",
        );
        profile.kyc.aadhaar_back = getFullImageUrl(
          req,
          profile.kyc.aadhaar_back,
          "kyc",
        );
        profile.kyc.pan_image = getFullImageUrl(
          req,
          profile.kyc.pan_image,
          "kyc",
        );
      }
      console.log(profile);
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
      return res.json(
        new ApiResponse(200, "KYC queue fetched successfully.", result),
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new CustomerController();
