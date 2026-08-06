import auditService from "./audit.service.js";
import asyncHandler from "../../shared/asyncHandler.js";
import ApiResponse from "../../shared/ApiResponse.js";

class AuditController {
  getLogs = asyncHandler(async (req, res) => {
    const filters = {
      search: req.query.search,
      userId: req.query.userId ? Number(req.query.userId) : undefined,
      roleName: req.query.roleName || req.query.role,
      module: req.query.module,
      action: req.query.action,
      branchId: req.query.branchId ? Number(req.query.branchId) : undefined,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
    };

    const data = await auditService.getAuditLogs(filters);
    return res.status(200).json(new ApiResponse(200, "Audit logs fetched successfully", data));
  });

  getStats = asyncHandler(async (req, res) => {
    const stats = await auditService.getStats();
    return res.status(200).json(new ApiResponse(200, "Audit statistics fetched successfully", stats));
  });

  exportCsv = asyncHandler(async (req, res) => {
    const filters = {
      search: req.query.search,
      userId: req.query.userId ? Number(req.query.userId) : undefined,
      roleName: req.query.roleName || req.query.role,
      module: req.query.module,
      action: req.query.action,
      branchId: req.query.branchId ? Number(req.query.branchId) : undefined,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    };

    const csvContent = await auditService.exportLogsCsv(filters);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=audit-logs-${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  });
}

export default new AuditController();
