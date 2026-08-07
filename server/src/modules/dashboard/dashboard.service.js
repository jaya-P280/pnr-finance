import dashboardRepository from "./dashboard.repository.js";

class DashboardService {
  async getStats(branchId) {
    const [
      totalCustomers,
      activeLoans,
      pendingApplications,
      overdueLoans,
      todayCollection,
      todayExpenses,
      pendingKycCount,
      totalStaff,
      financialLedger,
      kycQueue,
      monthlyCollection,
      monthlyChart,
      branchPerformance
    ] = await Promise.all([
      dashboardRepository.getTotalCustomers(branchId),
      dashboardRepository.getActiveLoans(branchId),
      dashboardRepository.getPendingApplications(),
      dashboardRepository.getOverdueLoans(branchId),
      dashboardRepository.getTodayCollection(),
      dashboardRepository.getTodayExpenses(),
      dashboardRepository.getPendingKycCount(),
      dashboardRepository.getTotalStaffCount(),
      dashboardRepository.getRecentFinancialLedger(),
      dashboardRepository.getRecentKycQueue(),
      dashboardRepository.getMonthlyCollection(),
      dashboardRepository.getMonthlyChart(),
      dashboardRepository.getBranchPerformance(),
    ]);

    return {
      totalCustomers,
      activeLoans,
      pendingApplications,
      overdueLoans,
      todayCollection,
      todayExpenses,
      pendingKycCount,
      totalStaff,
      financialLedger,
      kycQueue,
      monthlyCollection,
      monthlyChart,
      branchPerformance,
    };
  }
}

export default new DashboardService();