import PaginationHelper from "../../shared/pagination.helper.js";
import reportsRepository from "./reports.repository.js";

class ReportsService {
  async getLoanReport(query) {
    const { page, limit, offset } = PaginationHelper.build(query);
    const filters = { ...query, page, limit, offset };
    const [rows] = await reportsRepository.getLoanReport(filters);
    const total = await reportsRepository.countLoans(filters);
    return { reports: rows, pagination: PaginationHelper.metadata(page, limit, total) };
  }

  async getCollectionReport(query) {
    const { page, limit, offset } = PaginationHelper.build(query);
    const filters = { ...query, page, limit, offset };
    const [rows] = await reportsRepository.getCollectionReport(filters);
    const total = await reportsRepository.countCollections(filters);
    return { reports: rows, pagination: PaginationHelper.metadata(page, limit, total) };
  }

  async getCustomerReport(query) {
    const { page, limit, offset } = PaginationHelper.build(query);
    const filters = { ...query, page, limit, offset };
    const [rows] = await reportsRepository.getCustomerReport(filters);
    const total = await reportsRepository.countCustomers(filters);
    return { reports: rows, pagination: PaginationHelper.metadata(page, limit, total) };
  }

  async getRecoveryReport(query) {
    return await reportsRepository.getRecoveryReport(query.branchId || null);
  }
}

export default new ReportsService();
