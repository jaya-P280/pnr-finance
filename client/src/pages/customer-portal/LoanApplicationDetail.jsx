import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerPortalApi } from '../../api/customer.api';
import toast from "react-hot-toast";
import {
  ArrowBack as ArrowLeft,
  CalendarMonth as Calendar,
  AttachMoney as DollarSign,
  Percent,
  CheckCircle,
  AccessTime as Clock,
  Download,
  Description as FileText,
} from "@mui/icons-material";

const LoanApplicationDetail = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      const response = await customerPortalApi.getApplicationDetails(id);
      setApplication(response.data);
    } catch (error) {
      toast.error('Failed to load application details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Application not found</h2>
        <Link to="/customer/applications" className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
          Back to Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          to="/customer/applications"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
      </div>

      {/* Application Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {application.loanProduct?.name || 'Loan Application'}
            </h2>
            <p className="text-gray-600 mt-1">Application #{application.applicationNumber || application.id}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            application.status === 'approved' ? 'bg-green-100 text-green-800' :
            application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            application.status === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {application.status === 'approved' && <CheckCircle className="w-4 h-4 mr-1" />}
            {application.status === 'pending' && <Clock className="w-4 h-4 mr-1" />}
            {application.status?.toUpperCase()}
          </span>
        </div>

        {/* Loan Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-gray-600 mb-2">
              <DollarSign className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Requested Amount</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">₹{application.requestedAmount?.toLocaleString() || '0'}</p>
          </div>

          {application.approvedAmount && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center text-green-600 mb-2">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Approved Amount</span>
              </div>
              <p className="text-2xl font-bold text-green-900">₹{application.approvedAmount.toLocaleString()}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-gray-600 mb-2">
              <Calendar className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Tenure</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{application.tenureMonths || '-'} months</p>
          </div>

          {application.interestRate && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-600 mb-2">
                <Percent className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Interest Rate</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{application.interestRate}% p.a.</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                <p className="text-sm text-gray-600">{new Date(application.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {application.submittedAt && (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Under Review</p>
                  <p className="text-sm text-gray-600">{new Date(application.submittedAt).toLocaleString()}</p>
                </div>
              </div>
            )}

            {application.approvedAt && (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Approved</p>
                  <p className="text-sm text-gray-600">{new Date(application.approvedAt).toLocaleString()}</p>
                </div>
              </div>
            )}

            {application.rejectedAt && (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Rejected</p>
                  <p className="text-sm text-gray-600">{new Date(application.rejectedAt).toLocaleString()}</p>
                  {application.rejectionReason && (
                    <p className="text-sm text-red-600 mt-1">Reason: {application.rejectionReason}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t mt-6 pt-6 flex space-x-3">
          {application.status === 'draft' && (
            <Link
              to={`/customer/apply-loan?id=${application.id}`}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Continue Application
            </Link>
          )}
          {application.status === 'pending' && (
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to withdraw this application?')) {
                  try {
                    await customerPortalApi.withdrawApplication(id);
                    toast.success('Application withdrawn successfully');
                    fetchApplicationDetails();
                  } catch (error) {
                    toast.error('Failed to withdraw application');
                  }
                }
              }}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Withdraw Application
            </button>
          )}
          {application.status === 'approved' && (
            <Link
              to={`/customer/loans/${application.loanId}`}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              View Loan Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoanApplicationDetail;
