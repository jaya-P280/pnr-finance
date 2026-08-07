import dashboardService from "./dashboard.service.js";
import ApiResponse from "../../shared/ApiResponse.js";

class DashboardController {
  getStats = async (req, res, next) => {
    try {
      let branchId = req.query.branchId || req.query.branch_id || null;
      if (!branchId && req.user && !["SUPER_ADMIN", "ADMIN"].includes(req.user.role_name)) {
        branchId = req.user.branch_id || null;
      }
      const roleName = req.user?.role_name || req.user?.role || "";
      const userId = req.user?.user_id || req.user?.userId;
      const stats = await dashboardService.getStats(branchId, roleName, userId);
      res.json(new ApiResponse(200, "Dashboard stats fetched.", stats));
    } catch (error) {
      next(error);
    }
  };
  getMyData = async (req, res) => {
    const userId = req.user.user_id || req.user.userId;
    const loans = await loanRepository.getLoansByUserId(userId);
    const ekycStatus = await customerRepository.getEkycStatusByUserId(userId);
    const emiSchedule = await loanRepository.getEmiScheduleByUserId(userId);

    res.json(
      new ApiResponse(200, "Success", {
        loans,
        ekycStatus: ekycStatus || "NOT_STARTED",
        emiSchedule: emiSchedule || [],
      }),
    );
  };
}

export default new DashboardController();
