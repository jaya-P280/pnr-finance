import dashboardService from "./dashboard.service.js";
import ApiResponse from "../../shared/ApiResponse.js";

class DashboardController {
  getStats = async (req, res, next) => {
    try {
      const branchId = req.user?.branch_id || req.query.branchId || null;
      const stats = await dashboardService.getStats(branchId);
      res.json(new ApiResponse(200, "Dashboard stats fetched.", stats));
    } catch (error) { next(error); }
  };
}

export default new DashboardController();