import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerPortalApi } from '../../api/customer.api';
import toast from "react-hot-toast";
import {
  Description as FileText,
  AccessTime as Clock,
  CheckCircle,
  Cancel as XCircle,
  WarningAmber as AlertCircle,
  Download,
  Visibility as Eye,
} from "@mui/icons-material";

const MyLoanApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await customerPortalApi.getMyApplications();
      setApplications(response.data);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'disbursed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'disbursed': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status?.toLowerCase() === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Loan Applications</h1>
          <p className="text-gray-600 mt-1">Track and manage your loan applications</p>
        </div>
        <Link
          to="/customer/apply-loan"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FileText className="w-5 h-5 mr-2" />
          New Application
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {['all', 'draft', 'pending', 'approved', 'rejected', 'disbursed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              filter === status
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? "You haven't created any loan applications yet."
              : `No ${filter} applications.`}
          </p>
          {filter === 'all' && (
            <Link
              to="/customer/apply-loan"
              className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Your First Application
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredApplications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {app.loanProduct?.name || 'Loan Application'}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span className="ml-1 capitalize">{app.status}</span>
                    </span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Application ID</p>
                      <p className="text-sm font-medium text-gray-900">#{app.applicationNumber || app.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Requested Amount</p>
                      <p className="text-sm font-medium text-gray-900">₹{app.requestedAmount?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tenure</p>
                      <p className="text-sm font-medium text-gray-900">{app.tenureMonths || '-'} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Applied On</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {app.status === 'rejected' && app.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {app.rejectionReason}
                      </p>
                    </div>
                  )}

                  {app.status === 'approved' && app.approvedAmount && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        <strong>Approved Amount:</strong> ₹{app.approvedAmount.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <Link
                    to={`/customer/applications/${app.id}`}
                    className="inline-flex items-center px-3 py-1.5 text-sm text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Link>
                  {app.status === 'draft' && (
                    <Link
                      to={`/customer/apply-loan?id=${app.id}`}
                      className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLoanApplications;
