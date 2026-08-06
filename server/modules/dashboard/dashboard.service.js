import dashboardRepository from "./dashboard.repository.js";

class DashboardService {
  async getStats(branchId) {
    const [totalCustomers, activeLoans, pendingApplications, overdueLoans,
      todayCollection, monthlyCollection, monthlyChart, branchPerformance] =
      await Promise.all([
        dashboardRepository.getTotalCustomers(branchId),
        dashboardRepository.getActiveLoans(branchId),
        dashboardRepository.getPendingApplications(branchId),
        dashboardRepository.getOverdueLoans(branchId),
        dashboardRepository.getTodayCollection(branchId),
        dashboardRepository.getMonthlyCollection(branchId),
        dashboardRepository.getMonthlyChart(branchId),
        dashboardRepository.getBranchPerformance(),
      ]);

    return {
      totalCustomers,
      activeLoans,
      pendingApplications,
      overdueLoans,
      todayCollection,
      monthlyCollection,
      monthlyChart,
      branchPerformance,
    };
  }
}

export default new DashboardService();