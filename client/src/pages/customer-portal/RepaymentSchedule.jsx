import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { customerPortalApi } from '../../api/customer.api';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  XCircle,
  Clock,
  Download,
  CreditCard,
  AlertCircle
} from 'lucide-react';

const RepaymentSchedule = () => {
  const { loanId } = useParams();
  const [loan, setLoan] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, [loanId]);

  const fetchSchedule = async () => {
    try {
      const [loanRes, scheduleRes] = await Promise.all([
        customerPortalApi.getLoanDetails(loanId),
        customerPortalApi.getRepaymentSchedule(loanId)
      ]);
      setLoan(loanRes.data);
      setSchedule(scheduleRes.data || []);
    } catch (error) {
      toast.error('Failed to load repayment schedule');
    } finally {
      setLoading(false);
    }
  };

  const getEmiStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <div className="flex items-center space-x-4">
        <Link
          to={`/customer/loans/${loanId}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back to Loan Details
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Repayment Schedule</h1>
      </div>

      {/* Loan Summary */}
      {loan && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Loan Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Loan Amount</p>
              <p className="text-lg font-semibold text-gray-900">₹{loan.disbursedAmount?.toLocaleString() || '0'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Interest Rate</p>
              <p className="text-lg font-semibold text-gray-900">{loan.interestRate || '-'}% p.a.</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tenure</p>
              <p className="text-lg font-semibold text-gray-900">{loan.tenureMonths || '-'} months</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">EMI Amount</p>
              <p className="text-lg font-semibold text-gray-900">₹{loan.emiAmount?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">EMI Schedule</h2>
        </div>
        
        {schedule.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No schedule available</h3>
            <p className="mt-1 text-sm text-gray-500">Repayment schedule has not been generated yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    EMI #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Principal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interest
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total EMI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outstanding Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedule.map((emi, index) => (
                  <tr key={emi.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{emi.installmentNumber || index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {emi.dueDate ? new Date(emi.dueDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{emi.principalAmount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{emi.interestAmount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{emi.totalAmount?.toLocaleString() || emi.principalAmount ? (emi.principalAmount + (emi.interestAmount || 0)).toLocaleString() : '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{emi.outstandingBalance?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEmiStatusColor(emi.status)}`}>
                        {emi.status === 'paid' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {emi.status === 'overdue' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {emi.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                        <span className="ml-1 capitalize">{emi.status || 'Pending'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {emi.paidDate ? new Date(emi.paidDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary Footer */}
        {schedule.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Principal</p>
                <p className="text-lg font-semibold text-gray-900">
                  ₹{schedule.reduce((sum, emi) => sum + (emi.principalAmount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Interest</p>
                <p className="text-lg font-semibold text-gray-900">
                  ₹{schedule.reduce((sum, emi) => sum + (emi.interestAmount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Payable</p>
                <p className="text-lg font-semibold text-gray-900">
                  ₹{schedule.reduce((sum, emi) => sum + (emi.totalAmount || emi.principalAmount || 0) + (emi.interestAmount || 0), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Paid EMIs</p>
                <p className="text-lg font-semibold text-green-600">
                  {schedule.filter(e => e.status === 'paid').length} / {schedule.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Download Option */}
      <div className="flex justify-end">
        <button
          onClick={() => toast.info('Download feature coming soon')}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Schedule (PDF)
        </button>
      </div>
    </div>
  );
};

export default RepaymentSchedule;
