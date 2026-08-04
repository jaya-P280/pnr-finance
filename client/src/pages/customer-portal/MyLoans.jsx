import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { customerPortalApi } from "../../api/customer.api";
import toast from "react-hot-toast";
import {
  CreditCard,
  CalendarMonth as Calendar,
  CheckCircle,
  AccessTime as Clock,
  ReceiptLong,
  Visibility as Eye,
  ArrowForward,
  MonetizationOn,
  Percent,
  AccountBalance,
} from "@mui/icons-material";

export default function MyLoans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      const response = await customerPortalApi.getMyActiveLoans();
      const body = response.data;
      const list = Array.isArray(body)
        ? body
        : Array.isArray(body?.data?.loans)
        ? body.data.loans
        : Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.loans)
        ? body.loans
        : [];
      setLoans(list);
    } catch (error) {
      toast.error("Failed to load active loans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const getLoanStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "closed":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "overdue":
        return "bg-rose-50 text-rose-700 border-rose-200";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  const totalOutstanding = loans.reduce((sum, loan) => sum + Number(loan.outstandingAmount || 0), 0);
  const nextDueDate = loans.find((l) => l.nextDueDate)?.nextDueDate;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Active Loans</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor running loan accounts, repayment timelines, and upcoming EMI schedules
          </p>
        </div>

        <Link
          to="/customer/apply-loan"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-teal-700/20 transition-all shrink-0"
        >
          <CreditCard className="w-5 h-5" />
          Apply For New Loan
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Loans</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{loans.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <MonetizationOn className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Outstanding</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">₹{totalOutstanding.toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Next Payment Due</span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {nextDueDate ? new Date(nextDueDate).toLocaleDateString("en-IN") : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Loans List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200/80 p-8 text-slate-500">
          <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium">Fetching active loan accounts...</p>
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No active loans found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You do not have any active running loan accounts currently.
          </p>
          <Link
            to="/customer/apply-loan"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            Apply for Loan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {loans.map((loan) => {
            const progress = (loan.repaymentProgress ?? Math.min(100, Math.round(((loan.disbursedAmount - loan.outstandingAmount) / (loan.disbursedAmount || 1)) * 100))) || 0;

            return (
              <div
                key={loan.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="space-y-5 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                        <AccountBalance className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Loan #{loan.loanNumber || loan.id}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Disbursed on {loan.disbursementDate ? new Date(loan.disbursementDate).toLocaleDateString("en-IN") : "N/A"}
                        </p>
                      </div>

                      <span className={`ml-auto sm:ml-0 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${getLoanStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-100">
                      <div>
                        <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Sanctioned</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          ₹{Number(loan.sanctionedAmount || loan.disbursedAmount || 0).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Outstanding</span>
                        <p className="text-sm font-bold text-emerald-700 mt-0.5">
                          ₹{Number(loan.outstandingAmount || 0).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Monthly EMI</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          ₹{Number(loan.emiAmount || 0).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">Interest Rate</span>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">{loan.interestRate || 12}% p.a.</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-500">Repayment Progress</span>
                        <span className="text-slate-900 font-bold">{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-teal-700 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center justify-end gap-3 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
                    <button
                      onClick={() => navigate(`/customer/loans/${loan.id}/schedule`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all w-full justify-center"
                    >
                      <ReceiptLong className="w-4 h-4" /> Repayment Schedule
                    </button>
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
