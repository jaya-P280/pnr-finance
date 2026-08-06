import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { customerPortalApi } from "../../api/customer.api";
import toast from "react-hot-toast";
import {
  ArrowBack as ArrowLeft,
  CalendarMonth as Calendar,
  AttachMoney as DollarSign,
  CheckCircle,
  AccessTime as Clock,
  Description as FileText,
  Cancel as XCircle,
  ReceiptLong,
  Person,
  BusinessCenter,
  Shield,
  MonetizationOn,
} from "@mui/icons-material";

export default function LoanApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await customerPortalApi.getApplicationDetails(id);
      setApplication(response.data?.data || response.data || null);
    } catch (error) {
      toast.error("Failed to load application details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-slate-200/80 p-8 text-slate-500 max-w-5xl mx-auto">
        <div className="w-8 h-8 border-3 border-teal-700 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Fetching application details...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-8 max-w-2xl mx-auto shadow-sm">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Application not found</h2>
        <p className="text-xs text-slate-500 mt-1">The requested loan application could not be located.</p>
        <Link
          to="/customer/applications"
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-700 text-white font-semibold text-xs rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Applications
        </Link>
      </div>
    );
  }

  const status = application.status?.toLowerCase() || "pending";

  const timelineSteps = [
    { title: "Application Submitted", done: true, desc: "Submitted successfully" },
    { title: "Document Review", done: ["approved", "disbursed", "pending"].includes(status), desc: "KYC & income check" },
    { title: "Credit Assessment", done: ["approved", "disbursed"].includes(status), desc: "Risk evaluation" },
    { title: "Loan Disbursal", done: status === "disbursed", desc: "Funds transferred" },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate("/customer/applications")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Applications
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application Details</h1>
            <span className="text-xs font-mono px-2.5 py-1 bg-slate-100 rounded-md text-slate-500 font-bold">
              #{application.applicationNumber || application.id}
            </span>
          </div>
        </div>

        <span
          className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize border ${
            status === "approved" || status === "disbursed"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : status === "rejected"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          Status: {status}
        </span>
      </div>

      {/* Main Info Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {application.loanProduct?.name || application.loanProductName || "Personal Loan"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Applied on {application.createdAt ? new Date(application.createdAt).toLocaleDateString("en-IN") : "N/A"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Requested Amount</span>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">
              ₹{Number(application.requestedAmount || 0).toLocaleString("en-IN")}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Approved Amount</span>
            <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
              {application.approvedAmount ? `₹${Number(application.approvedAmount).toLocaleString("en-IN")}` : "Pending"}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Requested Tenure</span>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">{application.tenureMonths || 12} Months</p>
          </div>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Purpose</span>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5 capitalize">{application.purpose || "Personal"}</p>
          </div>
        </div>

        {/* Rejection / Approval Notice */}
        {status === "rejected" && application.rejectionReason && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            <strong>Rejection Reason:</strong> {application.rejectionReason}
          </div>
        )}

        {/* Status Timeline */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Application Tracking Timeline</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {timelineSteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  step.done ? "bg-teal-50/60 border-teal-200 text-teal-900" : "bg-slate-50 border-slate-200 text-slate-400"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {step.done ? <CheckCircle className="w-4 h-4 text-teal-700" /> : <Clock className="w-4 h-4 text-slate-400" />}
                  <span className="font-bold text-xs">{step.title}</span>
                </div>
                <p className="text-[11px] opacity-80">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
