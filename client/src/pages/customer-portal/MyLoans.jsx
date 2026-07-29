import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { customerPortalApi } from '../../api/customer.api';
import { toast } from 'react-toastify';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  Clock,
  DollarSign,
  Download,
  Eye
} from 'lucide-react';

const MyLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await customerPortalApi.getMyActiveLoans();
      setLoans(response.data);
    } catch (error) {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const getLoanStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Active Loans</h1>
        <p className="text-gray-600 mt-1">View and manage your active loans</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
              <CreditCard className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Active Loans</p>
              <p className="text-2xl font-semibold text-gray-900">{loans.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{loans.reduce((sum, loan) => sum + (loan.outstandingAmount || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Next Payment Due</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loans.find(l => l.nextDueDate)?.nextDueDate 
                  ? new Date(loans.find(l => l.nextDueDate).nextDueDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loans List */}
      {loans.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No active loans</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have any active loans at the moment.</p>
          <Link
            to="/customer/applications"
            className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            View Applications
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {loans.map((loan) => (
            <div
              key={loan.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Loan #{loan.loanNumber || loan.id}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLoanStatusColor(loan.status)}`}>
                      {loan.status === 'active' && <CheckCircle className="w-4 h-4 mr-1" />}
                      {loan.status === 'overdue' && <Clock className="w-4 h-4 mr-1" />}
                      <span className="ml-1 capitalize">{loan.status}</span>
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Sanctioned Amount</p>
                      <p className="text-sm font-medium text-gray-900">₹{loan.sanctionedAmount?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Disbursed Amount</p>
                      <p className="text-sm font-medium text-gray-900">₹{loan.disbursedAmount?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Outstanding</p>
                      <p className="text-sm font-medium text-gray-900">₹{loan.outstandingAmount?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Interest Rate</p>
                      <p className="text-sm font-medium text-gray-900">{loan.interestRate || '-'}% p.a.</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Tenure</p>
                      <p className="text-sm font-medium text-gray-900">{loan.tenureMonths || '-'} months</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">EMI Amount</p>
                      <p className="text-sm font-medium text-gray-900">₹{loan.emiAmount?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Disbursement Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {loan.disbursementDate ? new Date(loan.disbursementDate).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Maturity Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {loan.maturityDate ? new Date(loan.maturityDate).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {loan.repaymentProgress !== undefined && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Repayment Progress</span>
                        <span className="font-medium text-gray-900">{loan.repaymentProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${loan.repaymentProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Link
                    to={`/customer/loans/${loan.id}`}
                    className="inline-flex items-center px-3 py-1.5 text-sm text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Link>
                  <Link
                    to={`/customer/loans/${loan.id}/schedule`}
                    className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Repayment Schedule
                  </Link>
                  <Link
                    to={`/customer/loans/${loan.id}/disbursement`}
                    className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Disbursement Info
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLoans;
