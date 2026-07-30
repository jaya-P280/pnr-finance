import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  Target, 
  FileText, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { customerPortalApi } from '../../api/customer.api';
import toast from 'react-hot-toast';

const ApplyLoan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loanProducts, setLoanProducts] = useState([]);
  const [formData, setFormData] = useState({
    loanProductId: '',
    loanAmount: '',
    tenureMonths: '12',
    loanPurpose: '',
    repaymentFrequency: 'Monthly'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchLoanProducts();
  }, []);

  const fetchLoanProducts = async () => {
    try {
      const response = await customerPortalApi.getLoanProducts();
      setLoanProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching loan products:', error);
      toast.error('Failed to load loan products');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.loanProductId) {
      newErrors.loanProductId = 'Please select a loan product';
    }
    
    if (!formData.loanAmount || parseFloat(formData.loanAmount) <= 0) {
      newErrors.loanAmount = 'Valid loan amount is required';
    } else {
      const amount = parseFloat(formData.loanAmount);
      const selectedProduct = loanProducts.find(p => p.id === formData.loanProductId);
      if (selectedProduct) {
        if (amount < selectedProduct.minAmount) {
          newErrors.loanAmount = `Minimum amount is ₹${selectedProduct.minAmount.toLocaleString()}`;
        }
        if (amount > selectedProduct.maxAmount) {
          newErrors.loanAmount = `Maximum amount is ₹${selectedProduct.maxAmount.toLocaleString()}`;
        }
      }
    }
    
    if (!formData.tenureMonths || parseInt(formData.tenureMonths) <= 0) {
      newErrors.tenureMonths = 'Valid tenure is required';
    }
    
    if (!formData.loanPurpose.trim()) {
      newErrors.loanPurpose = 'Loan purpose is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const payload = {
        loanProductId: parseInt(formData.loanProductId),
        loanAmount: parseFloat(formData.loanAmount),
        tenureMonths: parseInt(formData.tenureMonths),
        loanPurpose: formData.loanPurpose,
        repaymentFrequency: formData.repaymentFrequency,
        status: 'DRAFT'
      };
      
      await customerPortalApi.applyForLoan(payload);
      
      toast.success('Loan application submitted successfully!');
      navigate('/customer/my-applications');
    } catch (error) {
      console.error('Loan application error:', error);
      const message = error.response?.data?.message || 'Failed to submit application. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const selectedProduct = loanProducts.find(p => p.id === formData.loanProductId);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/customer/my-applications')}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Applications
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Apply for New Loan</h1>
              <p className="text-gray-600 mt-1">Fill in the details to submit your loan application</p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Loan Product Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Loan Product <span className="text-red-500">*</span>
                </label>
                <select
                  name="loanProductId"
                  value={formData.loanProductId}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${errors.loanProductId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white`}
                >
                  <option value="">Choose a loan product...</option>
                  {loanProducts.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.productName} - {product.interestRate}% Interest
                    </option>
                  ))}
                </select>
                {errors.loanProductId && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.loanProductId}
                  </p>
                )}
              </div>

              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-semibold">₹</span>
                  </div>
                  <input
                    type="number"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    className={`w-full pl-10 pr-4 py-3 border ${errors.loanAmount ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all`}
                  />
                </div>
                {errors.loanAmount && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.loanAmount}
                  </p>
                )}
                {selectedProduct && (
                  <p className="mt-2 text-sm text-gray-600">
                    Min: ₹{selectedProduct.minAmount?.toLocaleString()} | Max: ₹{selectedProduct.maxAmount?.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Tenure */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Tenure (Months) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="tenureMonths"
                    value={formData.tenureMonths}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 border ${errors.tenureMonths ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white`}
                  >
                    {[6, 12, 18, 24, 36, 48, 60].map(months => (
                      <option key={months} value={months}>{months} Months</option>
                    ))}
                  </select>
                </div>
                {errors.tenureMonths && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.tenureMonths}
                  </p>
                )}
              </div>

              {/* Loan Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="loanPurpose"
                  value={formData.loanPurpose}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe why you need this loan..."
                  className={`w-full px-4 py-3 border ${errors.loanPurpose ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none`}
                />
                {errors.loanPurpose && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.loanPurpose}
                  </p>
                )}
              </div>

              {/* Repayment Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repayment Frequency
                </label>
                <select
                  name="repaymentFrequency"
                  value={formData.repaymentFrequency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Bi-Weekly">Bi-Weekly</option>
                </select>
              </div>

              {/* Summary Box */}
              {selectedProduct && formData.loanAmount && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <h3 className="font-semibold text-green-800 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Application Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Product</p>
                      <p className="font-semibold text-gray-900">{selectedProduct.productName}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Interest Rate</p>
                      <p className="font-semibold text-gray-900">{selectedProduct.interestRate}% p.a.</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Processing Fee</p>
                      <p className="font-semibold text-gray-900">{selectedProduct.processingFee}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tenure</p>
                      <p className="font-semibold text-gray-900">{formData.tenureMonths} Months</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-5 w-5" />
                      Submit Loan Application
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-gray-500 mt-3">
                  Your application will be saved as draft and can be edited before final submission.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLoan;
