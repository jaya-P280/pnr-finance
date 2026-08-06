import auditApi from "../api/audit.api";

class AuditService {
  async getLogs(params) {
    const res = await auditApi.getLogs(params);
    return res.data;
  }

  async getStats() {
    const res = await auditApi.getStats();
    return res.data;
  }

  async exportCsv(params) {
    const res = await auditApi.exportCsv(params);
    const blob = new Blob([res.data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `audit-trail-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export default new AuditService();
