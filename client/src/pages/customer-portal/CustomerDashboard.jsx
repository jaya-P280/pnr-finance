import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customerPortalApi } from "../../api/customer.api";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import {
  VerifiedUser,
  Description,
  Assignment,
  AccountBalanceWallet,
  ArrowForward,
  TrendingUp,
  CreditCard,
  AccessTime,
  CheckCircle,
  Shield,
  AddCircleOutlined,
  ReceiptLong,
} from "@mui/icons-material";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const name = user?.firstName || user?.first_name || "Valued Customer";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeLoansCount: 0,
    totalOutstanding: 0,
    pendingApplicationsCount: 0,
    nextEmiAmount: 0,
    nextEmiDate: null,
  });
  const [kycStatus, setKycStatus] = useState({ aadhaarVerified: false, panVerified: false });
  const [recentApplications, setRecentApplications] = useState([]);

  const extractArray = useCallback((res, field) => {
    if (!res) return [];
    const body = res.data;
    if (Array.isArray(body)) return body;
    if (Array.isArray(body?.data)) return body.data;
    if (field && Array.isArray(body?.data?.[field])) return body.data[field];
    if (field && Array.isArray(body?.[field])) return body[field];
    if (Array.isArray(body?.data?.applications)) return body.data.applications;
    if (Array.isArray(body?.data?.loans)) return body.data.loans;
    return [];
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [appsRes, loansRes, kycRes] = await Promise.allSettled([
        customerPortalApi.getMyApplications(),
        customerPortalApi.getMyActiveLoans(),
        customerPortalApi.getKycStatus(),
      ]);

      const applications = extractArray(appsRes.status === "fulfilled" ? appsRes.value : null, "applications");
      const loans = extractArray(loansRes.status === "fulfilled" ? loansRes.value : null, "loans");
      const kyc = kycRes.status === "fulfilled" ? (kycRes.value.data?.data || kycRes.value.data || {}) : {};

      setRecentApplications(applications.slice(0, 3));
      setKycStatus(kyc);

      const activeLoans = loans.filter((l) => l.status?.toLowerCase() === "active" || l.status?.toLowerCase() === "disbursed" || !l.status);
      const pendingApps = applications.filter((a) => a.status?.toLowerCase() === "pending" || a.status?.toLowerCase() === "submitted" || a.status?.toLowerCase() === "under_review");
      const totalOut = activeLoans.reduce((sum, l) => sum + Number(l.outstandingAmount || 0), 0);
      const nextLoan = activeLoans.find((l) => l.nextDueDate);

      setStats({
        activeLoansCount: activeLoans.length,
        totalOutstanding: totalOut,
        pendingApplicationsCount: pendingApps.length,
        nextEmiAmount: nextLoan?.emiAmount || 0,
        nextEmiDate: nextLoan?.nextDueDate || null,
      });
    } catch (err) {
      console.error("Failed to load customer dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, [extractArray]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const isKycComplete = kycStatus?.aadhaarVerified && kycStatus?.panVerified;

  const quickActions = [
    {
      title: "Apply for a Loan",
      description: "Quick approval with flexible interest rates & easy EMIs",
      icon: Description,
      path: "/customer/apply-loan",
      bgColor: "bg-blue-500",
      textColor: "text-blue-600",
      badge: "Popular",
    },
    {
      title: "Complete e-KYC",
      description: "Upload Aadhaar & PAN for instant profile verification",
      icon: VerifiedUser,
      path: "/customer/ekyc",
      bgColor: "bg-emerald-500",
      textColor: "text-emerald-600",
      badge: isKycComplete ? "Verified" : "Action Needed",
    },
    {
      title: "My Applications",
      description: "Track realtime status of your submitted loan applications",
      icon: Assignment,
      path: "/customer/applications",
      bgColor: "bg-teal-700",
      textColor: "text-teal-700",
    },
    {
      title: "My Active Loans",
      description: "Check balances, repayment schedules, and make EMI payments",
      icon: AccountBalanceWallet,
      path: "/customer/loans",
      bgColor: "bg-emerald-600",
      textColor: "text-emerald-700",
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold tracking-wide">
              <Shield className="w-3.5 h-3.5" /> Customer Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {name}! 👋
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
              Manage your personal loans, view repayment schedules, and apply for new financing options with instant approval.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate("/customer/apply-loan")}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-semibold text-sm shadow-lg shadow-teal-700/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <AddCircleOutlined className="w-5 h-5" />
              Apply for Loan
            </button>
            <button
              onClick={() => navigate("/customer/ekyc")}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-medium text-sm border border-white/20 transition-all"
            >
              <VerifiedUser className="w-5 h-5 text-emerald-400" />
              {isKycComplete ? "KYC Verified" : "Verify e-KYC"}
            </button>
          </div>
        </div>
      </div>

      {/* KYC Alert Banner if incomplete */}
      {!isKycComplete && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5 sm:mt-0">
              <AccessTime className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 text-sm sm:text-base">Identity Verification Pending</h4>
              <p className="text-xs sm:text-sm text-amber-700 mt-0.5">
                Complete your e-KYC verification with Aadhaar & PAN to unlock faster loan disbursals and higher sanction limits.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/customer/ekyc")}
            className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
          >
            Complete KYC Now
          </button>
        </div>
      )}

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Loans</span>
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{loading ? "..." : stats.activeLoansCount}</h3>
            <p className="text-xs text-slate-500 mt-1">Currently running accounts</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Outstanding</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">
              {loading ? "..." : `₹${stats.totalOutstanding.toLocaleString("en-IN")}`}
            </h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">Principal remaining</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Applications</span>
            <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
              <Assignment className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{loading ? "..." : stats.pendingApplicationsCount}</h3>
            <p className="text-xs text-teal-700 font-medium mt-1">Under verification</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Next EMI Due</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <ReceiptLong className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">
              {loading ? "..." : stats.nextEmiAmount > 0 ? `₹${stats.nextEmiAmount.toLocaleString("en-IN")}` : "₹0"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {stats.nextEmiDate ? `Due: ${new Date(stats.nextEmiDate).toLocaleDateString("en-IN")}` : "No immediate dues"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Hub */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
            <p className="text-xs sm:text-sm text-slate-500">Fast access to your essential portal features</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.title}
                onClick={() => navigate(action.path)}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${action.bgColor} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {action.badge && (
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        action.badge === "Verified"
                          ? "bg-emerald-100 text-emerald-800"
                          : action.badge === "Action Needed"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-teal-100 text-teal-800"
                      }`}>
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-bold text-teal-700 group-hover:gap-2 transition-all">
                  <span>Open Portal</span>
                  <ArrowForward className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Applications Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Applications</h3>
            <p className="text-xs text-slate-500">Track status of your recent financing requests</p>
          </div>
          <button
            onClick={() => navigate("/customer/applications")}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            View All <ArrowForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Loading applications...</div>
        ) : recentApplications.length === 0 ? (
          <div className="py-10 text-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200">
            <Description className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-medium text-sm">No loan applications submitted yet</p>
            <p className="text-xs text-slate-400 mt-1">Get instant loan sanction by applying today.</p>
            <button
              onClick={() => navigate("/customer/apply-loan")}
              className="mt-4 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Start Application
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                onClick={() => navigate(`/customer/applications/${app.id}`)}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
                    <Description className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {app.loanProduct?.name || app.loanProductName || "Personal Loan"}
                      </h4>
                      <span className="text-xs text-slate-400 font-mono">#{app.applicationNumber || app.id}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Requested: <strong className="text-slate-700">₹{Number(app.requestedAmount || 0).toLocaleString("en-IN")}</strong> • {app.tenureMonths || 12} Months
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      app.status === "approved" || app.status === "disbursed"
                        ? "bg-emerald-100 text-emerald-800"
                        : app.status === "rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {app.status || "pending"}
                  </span>
                  <ArrowForward className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
