import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customerPortalApi } from "../../api/customer.api";
import toast from "react-hot-toast";
import {
  Calculate as Calculator,
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
  ArrowBack,
  Shield,
  Percent,
  Payments,
  AttachMoney,
  Done,
} from "@mui/icons-material";

export default function ApplyLoan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeStep, setActiveStep] = useState(1);

  const [formData, setFormData] = useState({
    loanProductId: "",
    amount: 50000,
    tenureMonths: 12,
    purpose: "Personal",
    employmentType: "Salaried",
    monthlyIncome: "50000",
    documents: null,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await customerPortalApi.getLoanProducts();
      const body = response.data;
      const rawList = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body?.data?.products)
        ? body.data.products
        : Array.isArray(body?.products)
        ? body.products
        : [];
      const productList = rawList.map((product) => ({
        ...product,
        loan_product_id: product.loan_product_id ?? product.id,
        product_name: product.product_name ?? product.name ?? "Personal Loan",
        interestRate: Number(product.interest_rate ?? product.interestRate ?? 12),
        maxAmount: Number(product.maximum_amount ?? product.maxAmount ?? 500000),
        minTenure: product.minimum_tenure ?? product.minTenure ?? 3,
        maxTenure: product.maximum_tenure ?? product.maxTenure ?? 60,
      }));

      setProducts(productList);
      if (productList.length > 0) {
        setSelectedProduct(productList[0]);
        setFormData((prev) => ({
          ...prev,
          loanProductId: productList[0].loan_product_id,
          amount: Math.min(50000, productList[0].maxAmount || 500000),
        }));
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast.error("Could not load loan products");
    }
  };

  const emiDetails = useMemo(() => {
    const principal = Number(formData.amount || 0);
    const annualRate = Number(selectedProduct?.interestRate || 12);
    const months = Number(formData.tenureMonths || 12);

    if (!principal || !months) {
      return { monthlyEmi: 0, totalInterest: 0, totalPayment: 0 };
    }

    const monthlyRate = annualRate / 12 / 100;
    const compoundFactor = (1 + monthlyRate) ** months;
    const emi = (principal * monthlyRate * compoundFactor) / (compoundFactor - 1);
    const totalPayment = emi * months;

    return {
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalPayment - principal),
      totalPayment: Math.round(totalPayment),
    };
  }, [formData.amount, formData.tenureMonths, selectedProduct]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setFormData((prev) => ({
      ...prev,
      loanProductId: product.loan_product_id,
      amount: Math.min(prev.amount, product.maxAmount || 500000),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, documents: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.loanProductId) {
      toast.error("Please select a loan product");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        loanProductId: formData.loanProductId,
        requestedAmount: Number(formData.amount),
        tenureMonths: Number(formData.tenureMonths),
        purpose: formData.purpose,
        employmentType: formData.employmentType,
        monthlyIncome: Number(formData.monthlyIncome || 0),
      };

      await customerPortalApi.applyForLoan(payload);
      toast.success("Loan application submitted successfully!");
      navigate("/customer/applications");
    } catch (error) {
      console.error("Submission failed", error);
      toast.error(error.response?.data?.message || "Failed to submit loan application");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: "Product & Amount" },
    { num: 2, title: "Employment & Income" },
    { num: 3, title: "Upload Documents" },
    { num: 4, title: "Review & Submit" },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/customer/dashboard")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowBack className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Apply for a New Loan</h1>
          <p className="text-sm text-slate-500 mt-0.5">Customize loan amount, select tenure, and complete instant application</p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
          <Shield className="w-4 h-4" /> 100% Secure & Instant Evaluation
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {steps.map((s) => {
            const isDone = activeStep > s.num;
            const isCurrent = activeStep === s.num;
            return (
              <button
                key={s.num}
                onClick={() => isDone && setActiveStep(s.num)}
                disabled={!isDone && !isCurrent}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  isCurrent
                    ? "bg-teal-700 text-white shadow-md shadow-teal-700/20"
                    : isDone
                    ? "bg-teal-50 text-teal-800 cursor-pointer"
                    : "bg-slate-50 text-slate-400 opacity-60"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCurrent
                      ? "bg-white text-teal-700"
                      : isDone
                      ? "bg-teal-700 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {isDone ? <Done className="w-4 h-4" /> : s.num}
                </div>
                <span className="text-xs font-bold truncate">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* STEP 1: Product & Amount Selection */}
        {activeStep === 1 && (
          <div className="space-y-6">
            {/* Loan Product Selection */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900">Select Loan Scheme</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {products.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-400 text-sm">Loading loan products...</div>
                ) : (
                  products.map((p) => {
                    const isSelected = selectedProduct?.loan_product_id === p.loan_product_id;
                    return (
                      <div
                        key={p.loan_product_id}
                        onClick={() => handleProductSelect(p)}
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? "border-teal-700 bg-teal-50/50 shadow-md"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800">
                              {p.interestRate}% p.a.
                            </span>
                            {isSelected && <CheckCircle className="w-5 h-5 text-teal-700" />}
                          </div>
                          <h3 className="font-bold text-slate-900 text-base">{p.product_name}</h3>
                          <p className="text-xs text-slate-500 mt-1">
                            Up to ₹{Number(p.maxAmount || 500000).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <p className="text-[11px] text-slate-400">Tenure: {p.minTenure} - {p.maxTenure} months</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Slider & Calculator */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
                <h2 className="text-lg font-bold text-slate-900">Customize Loan Details</h2>

                {/* Amount Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase text-slate-500">Loan Amount (₹)</label>
                    <span className="text-xl font-extrabold text-teal-700">
                      ₹{Number(formData.amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max={selectedProduct?.maxAmount || 500000}
                    step="5000"
                    value={formData.amount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>₹10,000</span>
                    <span>₹{Number(selectedProduct?.maxAmount || 500000).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Tenure Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase text-slate-500">Tenure (Months)</label>
                    <span className="text-xl font-extrabold text-teal-700">{formData.tenureMonths} Months</span>
                  </div>
                  <input
                    type="range"
                    min={selectedProduct?.minTenure || 3}
                    max={selectedProduct?.maxTenure || 60}
                    step="3"
                    value={formData.tenureMonths}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tenureMonths: Number(e.target.value) }))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
                  />
                  <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>{selectedProduct?.minTenure || 3} Months</span>
                    <span>{selectedProduct?.maxTenure || 60} Months</span>
                  </div>
                </div>

                {/* Purpose Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Loan Purpose</label>
                  <select
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="Personal">Personal Expense</option>
                    <option value="Home Improvement">Home Improvement</option>
                    <option value="Education">Higher Education</option>
                    <option value="Medical">Medical Emergency</option>
                    <option value="Business Expansion">Business Expansion</option>
                    <option value="Vehicle Purchase">Vehicle Purchase</option>
                  </select>
                </div>
              </div>

              {/* EMI Preview Card */}
              <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider mb-3">
                    <Calculator className="w-4 h-4" /> EMI Calculator Breakdown
                  </div>
                  <p className="text-xs text-slate-400">Estimated monthly repayment based on current interest rates.</p>

                  <div className="mt-6 space-y-4">
                    <div className="p-4 rounded-xl bg-white/10 border border-white/10">
                      <span className="text-xs text-slate-300">Estimated Monthly EMI</span>
                      <p className="text-3xl font-extrabold text-white mt-1">
                        ₹{emiDetails.monthlyEmi.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-slate-400">Total Interest</span>
                        <p className="font-bold text-amber-300 mt-0.5">₹{emiDetails.totalInterest.toLocaleString("en-IN")}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-slate-400">Total Payable</span>
                        <p className="font-bold text-teal-300 mt-0.5">₹{emiDetails.totalPayment.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="w-full py-3.5 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-teal-700/30 transition-all flex items-center justify-center gap-2"
                >
                  Continue to Step 2 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Employment & Income Details */}
        {activeStep === 2 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Employment & Financial Profile</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="Salaried">Salaried Employee</option>
                  <option value="Self Employed">Self Employed / Business Owner</option>
                  <option value="Professional">Doctor / Lawyer / CA</option>
                  <option value="Government Employee">Government Sector</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Net Monthly Income (₹)</label>
                <input
                  type="number"
                  name="monthlyIncome"
                  required
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  placeholder="e.g. 50000"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Document Upload */}
        {activeStep === 3 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Upload Supporting Documents</h2>
            <p className="text-xs text-slate-500">Upload income proof, salary slips, or bank statement (Optional at stage 1)</p>

            <div className="border-2 border-dashed border-slate-300 hover:border-teal-600 rounded-2xl p-8 text-center bg-slate-50/50 transition-all">
              <Upload className="w-10 h-10 text-teal-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">Select Document File</p>
              <p className="text-xs text-slate-400 mt-1">PDF, PNG, or JPG up to 10MB</p>
              <input type="file" onChange={handleFileChange} className="mt-4 text-xs mx-auto" />
              {formData.documents && (
                <p className="text-xs font-semibold text-teal-700 mt-3">
                  Selected: {formData.documents.name}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5"
              >
                Review Application <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Final Review & Submit */}
        {activeStep === 4 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Review Application Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200/80 text-sm">
              <div>
                <span className="text-slate-400 text-xs">Loan Scheme</span>
                <p className="font-bold text-slate-900">{selectedProduct?.product_name}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Requested Loan Amount</span>
                <p className="font-bold text-teal-700">₹{Number(formData.amount).toLocaleString("en-IN")}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Tenure & Rate</span>
                <p className="font-bold text-slate-900">{formData.tenureMonths} Months @ {selectedProduct?.interestRate}% p.a.</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs">Monthly Estimated EMI</span>
                <p className="font-bold text-teal-700">₹{emiDetails.monthlyEmi.toLocaleString("en-IN")}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-teal-700/30 transition-all flex items-center gap-2"
              >
                {loading ? "Submitting..." : "Submit Loan Application"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
