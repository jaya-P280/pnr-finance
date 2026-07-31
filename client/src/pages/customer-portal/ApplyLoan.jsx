import { useEffect, useMemo, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Calculate as Calculator,
  CreditCard,
  CheckCircle,
  ArrowForward as ArrowRight,
  UploadFile as Upload,
  Description as FileText,
  InfoOutlined as Info,
  BusinessCenter as Briefcase,
  Home,
  DirectionsCar as Car,
  Person as User,
  MedicalServices as Stethoscope,
  School as GraduationCap,
} from '@mui/icons-material';
import { customerPortalApi } from '../../api/customer.api';
import toast from 'react-hot-toast';

const ApplyLoan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    loanProductId: '',
    amount: 50000,
    tenureMonths: 12,
    purpose: 'Personal',
    employmentType: 'Salaried',
    monthlyIncome: '',
    documents: null
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await customerPortalApi.getLoanProducts();
        const productList = (response.data?.data || []).map((product) => ({
          ...product,
          loan_product_id: product.loan_product_id ?? product.id,
          product_name: product.product_name ?? product.name,
          interestRate: Number(product.interest_rate ?? product.interestRate ?? 0),
          maxAmount: Number(product.maximum_amount ?? product.maxAmount ?? 0),
          minTenure: product.minimum_tenure ?? product.minTenure ?? 1,
          maxTenure: product.maximum_tenure ?? product.maxTenure ?? 60,
        }));
        setProducts(productList);
        if (productList.length > 0) {
          setSelectedProduct(productList[0]);
          setFormData(prev => ({ ...prev, loanProductId: productList[0].loan_product_id }));
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
        toast.error("Could not load loan products");
      }
    };
    fetchProducts();
  }, []);

  const emiDetails = useMemo(() => {
    const principal = Number(formData.amount);
    const annualRate = Number(selectedProduct?.interestRate || 0);
    const months = Number(formData.tenureMonths);

    if (!principal || !months) {
      return { monthlyEmi: 0, totalInterest: 0, totalPayment: 0 };
    }

    if (annualRate <= 0) {
      return {
        monthlyEmi: Math.round(principal / months),
        totalInterest: 0,
        totalPayment: principal,
      };
    }

    const monthlyRate = annualRate / 12 / 100;
    const compoundFactor = (1 + monthlyRate) ** months;
    const emi =
      (principal * monthlyRate * compoundFactor) /
      (compoundFactor - 1);
    const totalPayment = emi * months;

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalPayment - principal),
      totalPayment: Math.round(totalPayment),
    };
  }, [formData.amount, formData.tenureMonths, selectedProduct]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData(prev => ({ ...prev, loanProductId: product.loan_product_id }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, documents: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error("Please select a loan product");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        loanProductId: formData.loanProductId,
        requestedAmount: Number(formData.amount),
        tenure: Number(formData.tenureMonths),
        purpose: formData.purpose,
        remarks: formData.monthlyIncome
          ? `Employment: ${formData.employmentType}; Monthly income: ${formData.monthlyIncome}`
          : `Employment: ${formData.employmentType}`,
      };

      await customerPortalApi.applyForLoan(payload);
      
      toast.success("Loan application submitted successfully!");
      navigate('/customer/applications');
    } catch (error) {
      console.error("Application error:", error);
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  const purposeOptions = [
    { value: 'Personal', label: 'Personal Needs', icon: User },
    { value: 'Business', label: 'Business Expansion', icon: Briefcase },
    { value: 'Home', label: 'Home Renovation', icon: Home },
    { value: 'Vehicle', label: 'Vehicle Purchase', icon: Car },
    { value: 'Medical', label: 'Medical Emergency', icon: Stethoscope },
    { value: 'Education', label: 'Education', icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Apply for a Loan</h1>
          <p className="mt-2 text-gray-600">Choose a product and calculate your EMI instantly</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Form Inputs */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Select Product */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  Select Loan Product
                </h2>
                {products.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No loan products available currently.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <div 
                        key={product.loan_product_id}
                        onClick={() => handleProductSelect(product)}
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                          selectedProduct?.loan_product_id === product.loan_product_id 
                            ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-900">{product.product_name}</h3>
                          {selectedProduct?.loan_product_id === product.loan_product_id && (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Interest: <span className="font-medium">{product.interestRate}% p.a.</span></p>
                        <p className="text-xs text-gray-500">Max Amount: ₹{product.maxAmount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Tenure: {product.minTenure} - {product.maxTenure} months</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Loan Details */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-blue-600" />
                  Loan Details
                </h2>
                
                <div className="space-y-6">
                  {/* Amount Slider */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Loan Amount</label>
                      <span className="text-sm font-bold text-blue-600">₹{formData.amount.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      name="amount"
                      min="10000"
                      max={selectedProduct?.maxAmount || 500000}
                      step="5000"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>₹10k</span>
                      <span>₹{selectedProduct?.maxAmount ? (selectedProduct.maxAmount/1000).toFixed(0) + 'k' : '500k'}</span>
                    </div>
                  </div>

                  {/* Tenure Slider */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Tenure (Months)</label>
                      <span className="text-sm font-bold text-blue-600">{formData.tenureMonths} Months</span>
                    </div>
                    <input
                      type="range"
                      name="tenureMonths"
                      min="3"
                      max="60"
                      step="1"
                      value={formData.tenureMonths}
                      onChange={handleChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>3 Mo</span>
                      <span>60 Mo</span>
                    </div>
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Loan</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {purposeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, purpose: opt.value }))}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                            formData.purpose === opt.value
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          <opt.icon className="h-6 w-6 mb-1" />
                          <span className="text-xs font-medium">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Employment & Income */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                      <select
                        name="employmentType"
                        value={formData.employmentType}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Salaried">Salaried</option>
                        <option value="Self-Employed">Self Employed</option>
                        <option value="Business">Business Owner</option>
                        <option value="Farmer">Farmer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (₹)</label>
                      <input
                        type="number"
                        name="monthlyIncome"
                        value={formData.monthlyIncome}
                        onChange={handleChange}
                        placeholder="e.g. 25000"
                        className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Documents */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Documents (Optional)
                </h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    id="doc-upload"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="doc-upload" className="mt-3 inline-block px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Select Files
                  </label>
                  {formData.documents && (
                    <p className="mt-2 text-sm text-green-600 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 mr-1" /> {formData.documents.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Summary Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Repayment Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-600">Loan Amount</span>
                    <span className="font-semibold text-gray-900">₹{formData.amount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-600">Interest Rate</span>
                    <span className="font-semibold text-gray-900">{selectedProduct?.interestRate || 0}% p.a.</span>
                  </div>

                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-gray-600">Tenure</span>
                    <span className="font-semibold text-gray-900">{formData.tenureMonths} Months</span>
                  </div>

                  {/* EMI Highlight */}
                  <div className="bg-blue-50 rounded-lg p-4 my-4">
                    <p className="text-sm text-blue-800 mb-1">Estimated Monthly EMI</p>
                    <p className="text-3xl font-bold text-blue-600">₹{emiDetails.monthlyEmi.toLocaleString()}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Total Interest</span>
                      <span>₹{emiDetails.totalInterest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-900 font-bold text-base pt-2 border-t border-gray-200">
                      <span>Total Payable</span>
                      <span>₹{emiDetails.totalPayment.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedProduct}
                  className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-lg font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      Apply Now <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4 flex items-center justify-center">
                  <Info className="h-3 w-3 mr-1" />
                  This is a preliminary application. Final approval subject to verification.
                </p>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLoan;
