import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { customerPortalApi } from "../../api/customer.api";
import toast from "react-hot-toast";
import {
  Description as FileText,
  AccessTime as Clock,
  CheckCircle,
  Cancel as XCircle,
  WarningAmber as AlertCircle,
  Visibility as Eye,
  Add,
  Search,
  FilterList,
  CalendarToday,
  Payments,
  HourglassEmpty,
  Edit,
} from "@mui/icons-material";

export default function MyLoanApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customerPortalApi.getMyApplications();
      const body = response.data;
      const list = Array.isArray(body)
        ? body
        : Array.isArray(body?.data?.applications)
        ? body.data.applications
        : Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.applications)
        ? body.applications
        : [];
      setApplications(list);
    } catch (error) {
      toast.error("Failed to load loan applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "approved":
      case "disbursed":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle className="w-3.5 h-3.5" />,
          label: s === "disbursed" ? "Disbursed" : "Approved",
        };
      case "pending":
      case "submitted":
      case "under_review":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <Clock className="w-3.5 h-3.5" />,
          label: "In Review",
        };
      case "rejected":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <XCircle className="w-3.5 h-3.5" />,
          label: "Rejected",
        };
      case "draft":
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          icon: <FileText className="w-3.5 h-3.5" />,
          label: "Draft",
        };
      default:
        return {
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          label: status || "Unknown",
        };
    }
  };

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => ["pending", "submitted", "under_review"].includes(a.status?.toLowerCase())).length,
    approved: applications.filter((a) => ["approved", "disbursed"].includes(a.status?.toLowerCase())).length,
    rejected: applications.filter((a) => a.status?.toLowerCase() === "rejected").length,
    draft: applications.filter((a) => a.status?.toLowerCase() === "draft").length,
  };

  const filteredApplications = applications.filter((app) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && ["pending", "submitted", "under_review"].includes(app.status?.toLowerCase())) ||
      (filter === "approved" && ["approved", "disbursed"].includes(app.status?.toLowerCase())) ||
      app.status?.toLowerCase() === filter;

    const query = searchTerm.toLowerCase();
    const productName = (app.loanProduct?.name || app.loanProductName || "Loan Application").toLowerCase();
    const appNum = (app.applicationNumber || app.id || "").toString().toLowerCase();

    const matchesSearch = productName.includes(query) || appNum.includes(query);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Loan Applications</h1>
          <p className="text-sm text-slate-500 mt-1">Track and check status of all your submitted financing applications</p>
        </div>

        <Link
          to="/customer/apply-loan"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-teal-700/20 transition-all shrink-0"
        >
          <Add className="w-5 h-5" />
          Apply For New Loan
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All Applications" },
              { id: "pending", label: "Pending" },
              { id: "approved", label: "Approved" },
              { id: "rejected", label: "Rejected" },
              { id: "draft", label: "Drafts" },
            ].map((tab) => {
              const count = counts[tab.id] || 0;
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-teal-700 text-white shadow-sm"
                      : "bg-slate-100/80 text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID or loan product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Applications Cards List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200/80 p-8 text-slate-500">
          <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium">Fetching loan applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <HourglassEmpty className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No applications found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? "No applications matched your search query."
              : filter === "all"
              ? "You haven't submitted any loan applications yet."
              : `No applications currently marked as ${filter}.`}
          </p>
          {filter === "all" && !searchTerm && (
            <Link
              to="/customer/apply-loan"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
            >
              <Add className="w-4 h-4" /> Create Your First Application
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApplications.map((app) => {
            const badge = getStatusBadge(app.status);
            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">
                        {app.loanProduct?.name || app.loanProductName || "Personal Loan Application"}
                      </h3>

                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                        {badge.icon}
                        <span>{badge.label}</span>
                      </div>

                      <span className="text-xs font-mono font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                        #{app.applicationNumber || app.id}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
                      <div>
                        <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Requested Amount</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          ₹{Number(app.requestedAmount || 0).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Tenure</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{app.tenureMonths || 12} Months</p>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Purpose</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5 capitalize">{app.purpose || "Personal"}</p>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Applied On</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString("en-IN") : "Recently"}
                        </p>
                      </div>
                    </div>

                    {app.status === "rejected" && app.rejectionReason && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Rejection Notice:</strong> {app.rejectionReason}
                        </div>
                      </div>
                    )}

                    {app.status === "approved" && app.approvedAmount && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Approved Amount:</strong> ₹{Number(app.approvedAmount).toLocaleString("en-IN")} — Disbursal in progress.
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                    <button
                      onClick={() => navigate(`/customer/applications/${app.id}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold rounded-xl transition-colors w-full sm:w-auto justify-center"
                    >
                      <Eye className="w-4 h-4" /> View Details
                    </button>

                    {app.status === "draft" && (
                      <button
                        onClick={() => navigate(`/customer/apply-loan?id=${app.id}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors w-full sm:w-auto justify-center"
                      >
                        <Edit className="w-4 h-4" /> Edit Draft
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
