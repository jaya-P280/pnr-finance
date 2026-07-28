import settingsService from "./settings.service.js";
import ApiResponse from "../../shared/ApiResponse.js";

class SettingsController {
  getProfile = async (req, res, next) => {
    try {
      const profile = await settingsService.getCompanyProfile();
      res.json(new ApiResponse(200, "Company profile fetched.", profile));
    } catch (error) { next(error); }
  };

  updateProfile = async (req, res, next) => {
    try {
      const result = await settingsService.updateCompanyProfile(req.body);
      res.json(new ApiResponse(200, "Company profile updated.", result));
    } catch (error) { next(error); }
  };

  getSystem = async (req, res, next) => {
    try {
      const settings = await settingsService.getSystemSettings();
      res.json(new ApiResponse(200, "System settings fetched.", settings));
    } catch (error) { next(error); }
  };

  updateSystem = async (req, res, next) => {
    try {
      const result = await settingsService.updateSystemSettings(req.body);
      res.json(new ApiResponse(200, "System settings updated.", result));
    } catch (error) { next(error); }
  };
}

export default new SettingsController();