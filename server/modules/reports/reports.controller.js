import reportsService from "./reports.service.js";
import ApiResponse from "../../shared/ApiResponse.js";

class ReportsController {
  loanReport = async (req, res, next) => {
    try {
      const result = await reportsService.getLoanReport(req.query);
      res.json(new ApiResponse(200, "Loan report generated.", result.reports, result.pagination));
    } catch (error) { next(error); }
  };

  collectionReport = async (req, res, next) => {
    try {
      const result = await reportsService.getCollectionReport(req.query);
      res.json(new ApiResponse(200, "Collection report generated.", result.reports, result.pagination));
    } catch (error) { next(error); }
  };

  customerReport = async (req, res, next) => {
    try {
      const result = await reportsService.getCustomerReport(req.query);
      res.json(new ApiResponse(200, "Customer report generated.", result.reports, result.pagination));
    } catch (error) { next(error); }
  };

  recoveryReport = async (req, res, next) => {
    try {
      const result = await reportsService.getRecoveryReport(req.query);
      res.json(new ApiResponse(200, "Recovery report generated.", result));
    } catch (error) { next(error); }
  };
}

export default new ReportsController();
