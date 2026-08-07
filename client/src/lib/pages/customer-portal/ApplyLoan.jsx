import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customerPortalApi } from "../../api/customer.api";
import toast from "react-hot-toast";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Chip,
  TextField,
  MenuItem,
  Stack,
  Avatar,
  Paper,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  Calculate as Calculator,
  ArrowForward as ArrowRight,
  UploadFile as Upload,
  ArrowBack,
  Shield,
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
    purpose: "Business Expansion",
    employmentType: "Self-Employed",
    monthlyIncome: "45000",
    remarks: "",
    documents: null,
  });

  const [kycVerified, setKycVerified] = useState(true);

  useEffect(() => {
    fetchProducts();
    checkKycStatus();
  }, []);

  const checkKycStatus = async () => {
    try {
      const res = await customerPortalApi.getKycStatus();
      const statusData = res.data?.data || res.data;
      const status = String(statusData?.status || statusData?.kyc_status || "").toUpperCase();
      if (status && status !== "VERIFIED" && status !== "APPROVED") {
        setKycVerified(false);
      }
    } catch {
      // Default fallback
    }
  };

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
        product_name: product.product_name ?? product.name ?? "Micro Business Loan",
        interestRate: Number(product.interest_rate ?? product.interestRate ?? 12),
        minAmount: Number(product.minimum_amount ?? product.minAmount ?? 5000),
        maxAmount: Number(product.maximum_amount ?? product.maxAmount ?? 500000),
        minTenure: Number(product.minimum_tenure ?? product.minTenure ?? 3),
        maxTenure: Number(product.maximum_tenure ?? product.maxTenure ?? 60),
      }));

      setProducts(productList);
      if (productList.length > 0) {
        setSelectedProduct(productList[0]);
        setFormData((prev) => ({
          ...prev,
          loanProductId: productList[0].loan_product_id,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      toast.error("Failed to load loan schemes");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error("Please select a loan scheme.");
      return;
    }

    if (!kycVerified) {
      toast.error("eKYC Verification Required! Please complete your eKYC identity verification before submitting a loan application.");
      navigate("/customer/ekyc");
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
        remarks: formData.remarks,
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
    "Select Loan Scheme & Amount",
    "Employment & Income",
    "Supporting Documents",
    "Review & Confirm",
  ];

  return (
    <Box sx={{ maxWidth: 1050, mx: "auto", pb: 6 }}>
      <Card elevation={0} sx={{ mb: 3, border: "1px solid #E2E8F0", borderRadius: 3, bgcolor: "#FFFFFF" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
            <Box>
              <Button
                size="small"
                startIcon={<ArrowBack />}
                onClick={() => navigate("/customer/dashboard")}
                sx={{ color: "#64748B", textTransform: "none", fontWeight: 600, mb: 0.5 }}
              >
                Back to Customer Dashboard
              </Button>
              <Typography variant="h5" fontWeight={800} color="#0F172A">
                Apply for a New Loan Scheme
              </Typography>
              <Typography variant="body2" color="#64748B">
                Select your loan product, customize amount & tenure, and complete instant digital evaluation.
              </Typography>
            </Box>

            <Chip
              icon={<Shield style={{ color: "#0F766E", fontSize: 16 }} />}
              label="100% Secure Digital Processing"
              sx={{ bgcolor: "#CCFBF1", color: "#0F766E", fontWeight: 700, px: 1 }}
            />
          </Stack>
        </CardContent>
      </Card>

      {!kycVerified && (
        <Alert
          severity="warning"
          sx={{ mb: 3, borderRadius: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate("/customer/ekyc")}
              sx={{ fontWeight: 700, bgcolor: "rgba(0,0,0,0.06)" }}
            >
              Complete eKYC Now
            </Button>
          }
        >
          <Typography fontWeight={700}>Identity eKYC Verification Required</Typography>
          You must complete your Aadhaar & PAN eKYC verification before your loan application can be processed.
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: 3, mb: 4, border: "1px solid #E2E8F0", borderRadius: 3 }}>
        <Stepper activeStep={activeStep - 1} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} completed={activeStep > index + 1}>
              <StepLabel
                StepIconProps={{
                  sx: {
                    "&.Mui-active": { color: "#0F766E" },
                    "&.Mui-completed": { color: "#0F766E" },
                  },
                }}
              >
                <Typography variant="caption" fontWeight={activeStep === index + 1 ? 700 : 500} color={activeStep === index + 1 ? "#0F766E" : "#64748B"}>
                  {label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <form onSubmit={handleSubmit}>
        {activeStep === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} color="#0F172A" mb={2.5}>
                    1. Select Microfinance Loan Scheme
                  </Typography>

                  <TextField
                    select
                    fullWidth
                    label="Select Microfinance Loan Scheme *"
                    value={formData.loanProductId}
                    onChange={(e) => {
                      const prod = products.find(
                        (p) => String(p.loan_product_id) === String(e.target.value)
                      );
                      if (prod) {
                        handleProductSelect(prod);
                      }
                    }}
                    helperText={
                      selectedProduct
                        ? `${selectedProduct.product_name} • Interest Rate: ${selectedProduct.interestRate}% p.a. • Allowed Amount: ₹${Number(selectedProduct.minAmount || 5000).toLocaleString()} - ₹${Number(selectedProduct.maxAmount || 500000).toLocaleString()}`
                        : "Select a scheme to view interest rate and loan limits"
                    }
                    sx={{ mb: 3 }}
                  >
                    {products.map((p) => (
                      <MenuItem key={p.loan_product_id} value={p.loan_product_id}>
                        <Box sx={{ py: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                            {p.product_name} ({p.interestRate}% p.a.)
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Limits: ₹{Number(p.minAmount || 5000).toLocaleString()} - ₹{Number(p.maxAmount || 500000).toLocaleString()} | Tenure: {p.minTenure || 3} - {p.maxTenure || 60} Mos
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="subtitle1" fontWeight={700} color="#0F172A" mb={2}>
                    2. Enter Loan Amount & Repayment Tenure
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Requested Loan Amount (₹) *"
                        name="amount"
                        value={formData.amount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({ ...prev, amount: val }));
                        }}
                        InputProps={{
                          startAdornment: (
                            <Typography variant="body2" fontWeight={700} color="#0F766E" sx={{ mr: 1 }}>
                              ₹
                            </Typography>
                          ),
                        }}
                        helperText={
                          selectedProduct
                            ? `Min: ₹${Number(selectedProduct.minAmount || 5000).toLocaleString()} | Max: ₹${Number(selectedProduct.maxAmount || 500000).toLocaleString()}`
                            : "Enter desired loan amount"
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Repayment Tenure (Months) *"
                        name="tenureMonths"
                        value={formData.tenureMonths}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData((prev) => ({ ...prev, tenureMonths: val }));
                        }}
                        InputProps={{
                          endAdornment: (
                            <Typography variant="body2" fontWeight={600} color="textSecondary" sx={{ ml: 1 }}>
                              Months
                            </Typography>
                          ),
                        }}
                        helperText={
                          selectedProduct
                            ? `Min: ${selectedProduct.minTenure || 3} Mos | Max: ${selectedProduct.maxTenure || 60} Mos`
                            : "Enter duration in months"
                        }
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card
                elevation={0}
                sx={{
                  background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                  color: "#FFFFFF",
                  borderRadius: 3,
                  p: 1,
                  position: "sticky",
                  top: 90,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: "rgba(15, 118, 110, 0.3)", color: "#2DD4BF" }}>
                      <Calculator />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800}>
                        EMI Calculation Breakdown
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                        Real-time estimated loan repayments
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 2 }} />

                  <Box sx={{ my: 2 }}>
                    <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                      Estimated Monthly EMI
                    </Typography>
                    <Typography variant="h3" fontWeight={800} sx={{ color: "#2DD4BF" }}>
                      ₹{emiDetails.monthlyEmi.toLocaleString()}
                    </Typography>
                  </Box>

                  <Stack spacing={1.5} sx={{ mt: 3, bgcolor: "rgba(255,255,255,0.05)", p: 2, borderRadius: 2 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                        Principal Amount
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        ₹{Number(formData.amount).toLocaleString()}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                        Interest Rate
                      </Typography>
                      <Typography variant="body2" fontWeight={700} sx={{ color: "#2DD4BF" }}>
                        {selectedProduct?.interestRate || 12}% p.a.
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: "#94A3B8" }}>
                        Total Interest Payable
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        ₹{emiDetails.totalInterest.toLocaleString()}
                      </Typography>
                    </Stack>
                    <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={700}>
                        Total Payable Amount
                      </Typography>
                      <Typography variant="body2" fontWeight={800} sx={{ color: "#2DD4BF" }}>
                        ₹{emiDetails.totalPayment.toLocaleString()}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    endIcon={<ArrowRight />}
                    onClick={() => setActiveStep(2)}
                    sx={{ mt: 3, bgcolor: "#0F766E", py: 1.5, borderRadius: 2.5, fontWeight: 700 }}
                  >
                    Continue to Employment Info
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {activeStep === 2 && (
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} color="#0F172A" mb={3}>
                Employment & Financial Profile
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Employment Type *"
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                  >
                    <MenuItem value="Salaried">Salaried Employee</MenuItem>
                    <MenuItem value="Self-Employed">Self-Employed / Business Owner</MenuItem>
                    <MenuItem value="Micro-Entrepreneur">Micro-Entrepreneur (SHG / Small Business)</MenuItem>
                    <MenuItem value="Agricultural">Agricultural / Farming</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Monthly Net Income (₹) *"
                    name="monthlyIncome"
                    value={formData.monthlyIncome}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Purpose of Loan *"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                  >
                    <MenuItem value="Business Expansion">Business Expansion / Inventory Purchase</MenuItem>
                    <MenuItem value="Home Improvement">Home Improvement / Renovation</MenuItem>
                    <MenuItem value="Education">Education / Skill Training</MenuItem>
                    <MenuItem value="Emergency">Emergency / Healthcare Expense</MenuItem>
                    <MenuItem value="Agriculture">Agricultural / Cattle Purchase</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Additional Remarks / Notes"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Optional notes for loan officer evaluation"
                  />
                </Grid>
              </Grid>

              <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
                <Button variant="outlined" onClick={() => setActiveStep(1)}>
                  Back
                </Button>
                <Button variant="contained" onClick={() => setActiveStep(3)} sx={{ bgcolor: "#0F766E" }}>
                  Continue to Documents
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {activeStep === 3 && (
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} color="#0F172A" mb={1}>
                Upload Supporting Documents
              </Typography>
              <Typography variant="body2" color="textSecondary" mb={3}>
                Attach proof of income or business registration (optional for fast-track processing).
              </Typography>

              <Paper
                sx={{
                  p: 4,
                  border: "2px dashed #CBD5E1",
                  borderRadius: 3,
                  textAlign: "center",
                  bgcolor: "#F8FAFC",
                  cursor: "pointer",
                  "&:hover": { borderColor: "#0F766E" },
                }}
              >
                <Upload sx={{ fontSize: 48, color: "#0F766E", mb: 1 }} />
                <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
                  Click or Drag & Drop Documents Here
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Supports PDF, PNG, JPG up to 10MB (Aadhaar, PAN, Bank Statement, Income Proof)
                </Typography>
              </Paper>

              <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
                <Button variant="outlined" onClick={() => setActiveStep(2)}>
                  Back
                </Button>
                <Button variant="contained" onClick={() => setActiveStep(4)} sx={{ bgcolor: "#0F766E" }}>
                  Review Application
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {activeStep === 4 && (
          <Card elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, p: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} color="#0F172A" mb={3}>
                Application Review & Summary
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2.5, borderRadius: 2.5, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#0F766E" mb={1.5}>
                      Selected Scheme & Details
                    </Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Scheme</Typography>
                        <Typography variant="body2" fontWeight={700}>{selectedProduct?.product_name}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Requested Amount</Typography>
                        <Typography variant="body2" fontWeight={700}>₹{Number(formData.amount).toLocaleString()}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Tenure</Typography>
                        <Typography variant="body2" fontWeight={700}>{formData.tenureMonths} Months</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Interest Rate</Typography>
                        <Typography variant="body2" fontWeight={700}>{selectedProduct?.interestRate}% p.a.</Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2.5, borderRadius: 2.5, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <Typography variant="subtitle2" fontWeight={700} color="#0F766E" mb={1.5}>
                      Applicant Profile & Repayment
                    </Typography>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Employment</Typography>
                        <Typography variant="body2" fontWeight={700}>{formData.employmentType}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Monthly Income</Typography>
                        <Typography variant="body2" fontWeight={700}>₹{Number(formData.monthlyIncome).toLocaleString()}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="textSecondary">Estimated EMI</Typography>
                        <Typography variant="body2" fontWeight={700} color="#0F766E">₹{emiDetails.monthlyEmi.toLocaleString()} / mo</Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>

              <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
                <Button variant="outlined" onClick={() => setActiveStep(3)}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !kycVerified}
                  sx={{ bgcolor: "#0F766E", py: 1.5, px: 4, borderRadius: 2.5, fontWeight: 700 }}
                >
                  {loading ? "Submitting Application..." : "Confirm & Submit Application"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}
      </form>
    </Box>
  );
}
