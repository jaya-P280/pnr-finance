import auditRepository from "./audit.repository.js";

class AuditService {
  async log(data) {
    await auditRepository.create(data);
  }

  async getAuditLogs(filters) {
    return await auditRepository.findAll(filters);
  }

  async getStats() {
    return await auditRepository.getStats();
  }

  async exportLogsCsv(filters) {
    const result = await auditRepository.findAll({ ...filters, page: 1, limit: 10000 });
    const logs = result.logs || [];

    const headers = [
      "Log ID",
      "Timestamp",
      "User ID",
      "User Name",
      "Email",
      "Role",
      "Branch ID",
      "HTTP Method",
      "Endpoint",
      "Module",
      "Action",
      "Status Code",
      "Response Time (ms)",
      "Success",
      "IP Address",
      "Correlation ID",
    ];

    const csvRows = [headers.join(",")];

    for (const log of logs) {
      const userName = log.first_name ? `${log.first_name} ${log.last_name || ""}`.trim() : "System/Guest";
      const row = [
        log.log_id,
        `"${new Date(log.created_at).toISOString()}"`,
        log.user_id || "",
        `"${userName.replace(/"/g, '""')}"`,
        `"${(log.email || "").replace(/"/g, '""')}"`,
        `"${log.role_name || ""}"`,
        log.branch_id || "",
        `"${log.http_method || ""}"`,
        `"${(log.endpoint || "").replace(/"/g, '""')}"`,
        `"${log.module || ""}"`,
        `"${log.action || ""}"`,
        log.response_status || "",
        log.response_time_ms || 0,
        log.is_success ? "SUCCESS" : "FAILED",
        `"${log.ip_address || ""}"`,
        `"${log.correlation_id || ""}"`,
      ];
      csvRows.push(row.join(","));
    }

    return csvRows.join("\n");
  }
}

export default new AuditService();
