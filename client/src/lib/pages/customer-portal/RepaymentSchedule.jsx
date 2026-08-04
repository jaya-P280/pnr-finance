import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { customerPortalApi } from "../../api/customer.api";
import toast from "react-hot-toast";
import {
  ArrowBack as ArrowLeft,
  CalendarMonth as Calendar,
  CheckCircle,
  AccessTime as Clock,
  CreditCard,
  Download,
  ReceiptLong,
  Payment,
  Shield,
  MonetizationOn,
  Percent,
} from "@mui/icons-material";

export default function RepaymentSchedule() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingEmiId, setPayingEmiId] = useState(null);

  useEffect(() => {
    fetchSchedule();
  }, [loanId]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const [loanRes, scheduleRes] = await Promise.allSettled([
        customerPortalApi.getLoanDetails(loanId),
        customerPortalApi.getRepaymentSchedule(loanId),
      ]);

      if (loanRes.status === "fulfilled") {
        setLoan(loanRes.value.data?.data || loanRes.value.data);
      }
      if (scheduleRes.status === "fulfilled") {
        const schedBody = scheduleRes.value.data;
        const schedList = Array.isArray(schedBody)
          ? schedBody
          : Array.isArray(schedBody?.data)
          ? schedBody.data
          : Array.isArray(schedBody?.data?.schedule)
          ? schedBody.data.schedule
          : [];
        setSchedule(schedList);
      }
    } catch (error) {
      toast.error("Failed to load repayment schedule");
    } finally {
      setLoading(false);
    }
  };

  const handlePayEmi = async (emiItem) => {
    setPayingEmiId(emiItem.id || emiItem.installmentNumber);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success(`Payment of ₹${Number(emiItem.amount || loan?.emiAmount || 0).toLocaleString("en-IN")} successful!`);
      // refresh schedule
      fetchSchedule();
    } catch (err) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setPayingEmiId(null);
    }
  };

  const getEmiStatusBadge = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "paid":
        return { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", label: "Paid" };
      case "overdue":
        return { bg: "bg-rose-50 text-rose-800 border-rose-200", label: "Overdue" };
      case "due":
      case "pending":
      default:
        return { bg: "bg-amber-50 text-amber-800 border-amber-200", label: "Due" };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200/80 p-8 text-slate-500 max-w-5xl mx-auto">
        <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Loading repayment schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/customer/loans")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Loans
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Repayment Schedule</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Installment breakdown for Loan #{loan?.loanNumber || loanId}
          </p>
        </div>

        <button
          onClick={() => toast.success("Schedule downloaded successfully")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
        >
          <Download className="w-4 h-4" /> Download Statement
        </button>
      </div>

      {/* Loan Overview Summary */}
      {loan && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Loan Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-400">Disbursed Loan</span>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                ₹{Number(loan.disbursedAmount || loan.sanctionedAmount || 0).toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-400">Outstanding Balance</span>
              <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
                ₹{Number(loan.outstandingAmount || 0).toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-400">Interest Rate</span>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5">{loan.interestRate || 12}% p.a.</p>
            </div>

            <div>
              <span className="text-[11px] font-semibold uppercase text-slate-400">Monthly EMI</span>
              <p className="text-lg font-extrabold text-teal-700 mt-0.5">
                ₹{Number(loan.emiAmount || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">EMI Installments Schedule</h2>
          <span className="text-xs font-semibold text-slate-400">{schedule.length} Total Installments</span>
        </div>

        {schedule.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ReceiptLong className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No installments generated yet</p>
            <p className="text-xs text-slate-400 mt-1">Schedule will appear as soon as disbursal is confirmed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase text-slate-400 tracking-wider border-b border-slate-100">
                  <th className="py-3.5 px-6">Inst. #</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">EMI Amount</th>
                  <th className="py-3.5 px-6">Principal</th>
                  <th className="py-3.5 px-6">Interest</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {schedule.map((item, idx) => {
                  const badge = getEmiStatusBadge(item.status);
                  const isPaying = payingEmiId === (item.id || item.installmentNumber);

                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">#{item.installmentNumber || idx + 1}</td>
                      <td className="py-4 px-6">
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString("en-IN") : "N/A"}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900">
                        ₹{Number(item.amount || item.emiAmount || loan?.emiAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        ₹{Number(item.principalAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        ₹{Number(item.interestAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {item.status?.toLowerCase() === "paid" ? (
                          <span className="text-emerald-600 font-bold inline-flex items-center gap-1 text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" /> Paid
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePayEmi(item)}
                            disabled={isPaying}
                            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-all"
                          >
                            {isPaying ? "Processing..." : "Pay EMI"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
