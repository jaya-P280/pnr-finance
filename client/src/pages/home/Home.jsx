import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Slider,
  TextField,
  Paper,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Avatar,
  Tab,
  Tabs,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Home as HomeIcon,
  Info as InfoIcon,
  Mail as MailIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Calculate as CalculateIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Groups as GroupsIcon,
  AccountBalance as BankIcon,
  Assignment as DocumentIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Verified as VerifiedIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  VerifiedUser as ShieldIcon,
  SupportAgent as SupportIcon,
  PlayCircle as PlayIcon,
  AutoAwesome as SparklesIcon,
} from "@mui/icons-material";
import useAuth from "../../hooks/useAuth";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // EMI Calculator State
  const [emiModalOpen, setEmiModalOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState(150000);
  const [tenureMonths, setTenureMonths] = useState(24);
  const [interestRate, setInterestRate] = useState(11.5);

  // Quick Hero Apply State
  const [quickLoanType, setQuickLoanType] = useState("BUSINESS");
  const [quickAmount, setQuickAmount] = useState(100000);

  // Product Filter State
  const [productCategory, setProductCategory] = useState("ALL");

  // Calculate EMI
  const calculateEmi = (amt = loanAmount, mos = tenureMonths, rate = interestRate) => {
    const p = Number(amt) || 0;
    const r = (Number(rate) || 0) / 12 / 100;
    const n = Number(mos) || 1;
    if (r === 0) return Math.round(p / n);
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi || 0);
  };

  const monthlyEmi = calculateEmi(loanAmount, tenureMonths, interestRate);
  const totalPayable = monthlyEmi * tenureMonths;
  const totalInterest = Math.max(0, totalPayable - loanAmount);

  const heroQuickEmi = calculateEmi(quickAmount, 24, 11);

  const loanProducts = [
    {
      id: "prod-1",
      category: "BUSINESS",
      title: "SME & Commercial Business Loan",
      tagline: "Working capital, shop expansion & machinery financing",
      amountRange: "₹50,000 – ₹25,00,000",
      tenure: "12 – 60 Months",
      interest: "Starting 10.5% p.a.",
      badge: "MOST POPULAR",
      badgeColor: "success",
      gradient: "linear-gradient(135deg, #0F766E 0%, #0D655E 100%)",
      features: [
        "No collateral required up to ₹3 Lakhs",
        "Flexible daily / weekly / monthly repayments",
        "Doorstep documentation & fast field verification",
        "Instant credit line expansion for prompt payers",
      ],
    },
    {
      id: "prod-2",
      category: "SHG",
      title: "Mahila SHG & Joint Liability Loan",
      tagline: "Community microfinance for women self-help groups",
      amountRange: "₹25,000 – ₹10,00,000",
      tenure: "6 – 24 Months",
      interest: "Starting 9.9% p.a.",
      badge: "COMMUNITY CHOICE",
      badgeColor: "secondary",
      gradient: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
      features: [
        "Joint Liability Group (JLG) trust model",
        "Weekly door-step center meeting collection",
        "Financial literacy & skill development workshops",
        "Zero processing fees for women entrepreneurs",
      ],
    },
    {
      id: "prod-3",
      category: "EDUCATION",
      title: "Higher Education & Skill Loan",
      tagline: "Indian & international university tuition financing",
      amountRange: "₹10,000 – ₹15,00,000",
      tenure: "12 – 48 Months",
      interest: "Starting 9.5% p.a.",
      badge: "LOW INTEREST",
      badgeColor: "info",
      gradient: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
      features: [
        "Covers college tuition, hostel & laptop costs",
        "Flexible moratorium till course completion",
        "Tax benefit under IT Act Section 80E",
        "Direct disbursal to university accounts",
      ],
    },
    {
      id: "prod-4",
      category: "PERSONAL",
      title: "Emergency Micro Personal Loan",
      tagline: "Immediate funding for medical or household needs",
      amountRange: "₹5,000 – ₹2,00,000",
      tenure: "3 – 18 Months",
      interest: "Starting 11.5% p.a.",
      badge: "INSTANT DISBURSAL",
      badgeColor: "warning",
      gradient: "linear-gradient(135deg, #EA580C 0%, #C2410C 100%)",
      features: [
        "100% digital paperless eKYC check",
        "Funds transferred to bank account in 60 mins",
        "Transparent schedule with zero hidden charges",
        "Minimal income proof documentation",
      ],
    },
  ];

  const filteredProducts = productCategory === "ALL" 
    ? loanProducts 
    : loanProducts.filter(p => p.category === productCategory);

  const workflowSteps = [
    {
      step: "01",
      title: "Instant Digital eKYC",
      desc: "Sign up in 2 minutes with mobile OTP and verify Aadhaar & PAN digitally.",
      icon: <PersonAddIcon sx={{ fontSize: 36, color: "#0F766E" }} />,
    },
    {
      step: "02",
      title: "Select Loan & Upload",
      desc: "Pick your loan scheme and upload basic address/income proof documents.",
      icon: <BankIcon sx={{ fontSize: 36, color: "#0F766E" }} />,
    },
    {
      step: "03",
      title: "Automated Approval",
      desc: "Credit engine and field officer verify details for rapid 24-hr approval.",
      icon: <SpeedIcon sx={{ fontSize: 36, color: "#0F766E" }} />,
    },
    {
      step: "04",
      title: "Direct Bank Disbursal",
      desc: "Approved funds are credited straight to your bank with online EMI tracking.",
      icon: <CheckCircleIcon sx={{ fontSize: 36, color: "#0F766E" }} />,
    },
  ];

  const testimonials = [
    {
      name: "Saraswathi Devi",
      role: "SHG Leader, Telangana",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
      comment: "PNRG Finance helped our 10-member group start a tailoring unit. Weekly collection is smooth and interest rates are very fair!",
    },
    {
      name: "Rajeshwar Rao",
      role: "Retail Shop Owner, Hyderabad",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      comment: "When my inventory needed quick restocking, PNRG Finance approved ₹2 Lakhs within 24 hours without collateral hassle.",
    },
    {
      name: "Ananya Reddy",
      role: "Engineering Student",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      comment: "The education loan allowed me to enroll in my master's degree smoothly. The portal repayment schedule is transparent and clear.",
    },
  ];

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", color: "#0F172A", width: "100%", overflowX: "hidden" }}>
      {/* 1. FULL-WIDTH GLASSMORPHIC HEADER NAVBAR */}
      <Box
        sx={{
          bgcolor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E2E8F0",
          position: "sticky",
          top: 0,
          zIndex: 1100,
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          width: "100%",
        }}
      >
        <Box sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 }, py: 1.8 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            {/* Brand Logo */}
            <Stack direction="row" alignItems="center" spacing={1.8} sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #0F766E 0%, #0D655E 50%, #F97316 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: 900,
                  fontSize: "1.35rem",
                  boxShadow: "0 6px 16px rgba(15, 118, 110, 0.3)",
                }}
              >
                P
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={900} letterSpacing={-0.5} sx={{ color: "#0F172A", lineHeight: 1.1, fontSize: "1.25rem" }}>
                  PNRG <span style={{ color: "#0F766E" }}>FINANCE</span>
                </Typography>
                <Typography variant="caption" color="#64748B" fontWeight={700} letterSpacing={0.8}>
                  MICROFINANCE & CREDIT ERP
                </Typography>
              </Box>
            </Stack>

            {/* Laptop Navigation Links */}
            {!isMobile && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Button startIcon={<HomeIcon />} sx={{ bgcolor: "#F0F9FF", color: "#0369A1", fontWeight: 700, borderRadius: 3, px: 2.5, textTransform: "none" }}>
                  Home
                </Button>
                <Button onClick={() => document.getElementById("loan-products")?.scrollIntoView({ behavior: "smooth" })} sx={{ color: "#475569", fontWeight: 600, px: 2, textTransform: "none", "&:hover": { bgcolor: "#F1F5F9" } }}>
                  Loan Schemes
                </Button>
                <Button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} sx={{ color: "#475569", fontWeight: 600, px: 2, textTransform: "none", "&:hover": { bgcolor: "#F1F5F9" } }}>
                  How It Works
                </Button>
                <Button onClick={() => setEmiModalOpen(true)} startIcon={<CalculateIcon />} sx={{ color: "#F97316", fontWeight: 700, px: 2, textTransform: "none", "&:hover": { bgcolor: "#FFF7ED" } }}>
                  EMI Calculator
                </Button>
                <Button onClick={() => document.getElementById("why-us")?.scrollIntoView({ behavior: "smooth" })} sx={{ color: "#475569", fontWeight: 600, px: 2, textTransform: "none", "&:hover": { bgcolor: "#F1F5F9" } }}>
                  Why PNRG
                </Button>
                <Button onClick={() => document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" })} sx={{ color: "#475569", fontWeight: 600, px: 2, textTransform: "none", "&:hover": { bgcolor: "#F1F5F9" } }}>
                  Contact HQ
                </Button>
              </Stack>
            )}

            {/* Header Right Action Buttons */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              {isAuthenticated ? (
                <Button
                  variant="contained"
                  startIcon={<DashboardIcon />}
                  onClick={() => navigate("/dashboard")}
                  sx={{
                    background: "linear-gradient(135deg, #0F766E 0%, #0D655E 100%)",
                    borderRadius: 3,
                    px: 3,
                    py: 1.1,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(15, 118, 110, 0.35)",
                  }}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<LoginIcon />}
                    onClick={() => navigate("/login")}
                    sx={{
                      borderColor: "#0F766E",
                      color: "#0F766E",
                      borderRadius: 3,
                      px: 2.8,
                      py: 1,
                      fontWeight: 700,
                      textTransform: "none",
                      "&:hover": { borderColor: "#0D655E", bgcolor: "#F0F9FF" },
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={() => navigate("/register")}
                    sx={{
                      background: "linear-gradient(135deg, #0F766E 0%, #0D655E 100%)",
                      borderRadius: 3,
                      px: 3,
                      py: 1,
                      fontWeight: 700,
                      textTransform: "none",
                      boxShadow: "0 4px 14px rgba(15, 118, 110, 0.35)",
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* 2. FULL-SCREEN LAPTOP HERO BANNER (Full Width Laptop Display) */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #064E3B 0%, #0F766E 40%, #0F172A 100%)",
          color: "#FFFFFF",
          pt: { xs: 6, md: 8 },
          pb: { xs: 8, md: 10 },
          px: { xs: 2, sm: 4, md: 6, lg: 8 },
          position: "relative",
          overflow: "hidden",
          width: "100%",
        }}
      >
        {/* Background Mesh Orbs */}
        <Box
          sx={{
            position: "absolute",
            top: "-15%",
            right: "-5%",
            width: 550,
            height: 550,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(0,0,0,0) 70%)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "-20%",
            left: "-5%",
            width: 650,
            height: 650,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, rgba(0,0,0,0) 70%)",
            pointerEvents: "none",
          }}
        />

        <Grid container spacing={5} alignItems="center" sx={{ maxWidth: 1600, mx: "auto" }}>
          {/* Left Column: Hero Copy & Actions */}
          <Grid item xs={12} lg={7}>
            <Stack spacing={3}>
              <Box>
                <Chip
                  icon={<SparklesIcon sx={{ color: "#F97316 !important", fontSize: "16px !important" }} />}
                  label="INSTANT MICROFINANCE & DIGITAL CREDIT PLATFORM"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.12)",
                    backdropFilter: "blur(10px)",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    px: 1,
                    py: 0.5,
                    border: "1px solid rgba(255,255,255,0.2)",
                    fontSize: "0.8rem",
                  }}
                />
              </Box>

              <Typography
                variant={isMobile ? "h4" : "h2"}
                fontWeight={900}
                letterSpacing={-1}
                sx={{ lineHeight: 1.15, textShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
              >
                Fast, Fair & Empowering Financial Solutions for Everyone.
              </Typography>

              <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.9, lineHeight: 1.6, maxWidth: 700 }}>
                Access instant business loans, Mahila SHG group financing, education credit, and personal microfinance with <b>100% digital eKYC verification</b> and rapid 24-hour disbursal.
              </Typography>

              {/* Floating Feature Pills */}
              <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 1 }}>
                <Chip icon={<VerifiedIcon sx={{ color: "#34D399 !important" }} />} label="Zero Collateral Loans" sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "#FFFFFF", fontWeight: 700 }} />
                <Chip icon={<SpeedIcon sx={{ color: "#34D399 !important" }} />} label="Disbursal in 60 Mins" sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "#FFFFFF", fontWeight: 700 }} />
                <Chip icon={<ShieldIcon sx={{ color: "#34D399 !important" }} />} label="Aadhaar/PAN Verified" sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "#FFFFFF", fontWeight: 700 }} />
              </Stack>

              {/* Action Buttons */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ pt: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(isAuthenticated ? "/customer/apply-loan" : "/register")}
                  sx={{
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    color: "#FFFFFF",
                    fontWeight: 900,
                    borderRadius: 4,
                    px: 4,
                    py: 1.8,
                    fontSize: "1.05rem",
                    textTransform: "none",
                    boxShadow: "0 8px 25px rgba(16, 185, 129, 0.4)",
                    "&:hover": { background: "linear-gradient(135deg, #059669 0%, #047857 100%)" },
                  }}
                >
                  Apply for Loan Now
                </Button>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CalculateIcon />}
                  onClick={() => setEmiModalOpen(true)}
                  sx={{
                    background: "linear-gradient(135deg, #F97316 0%, #EA580C 100%)",
                    color: "#FFFFFF",
                    fontWeight: 900,
                    borderRadius: 4,
                    px: 4,
                    py: 1.8,
                    fontSize: "1.05rem",
                    textTransform: "none",
                    boxShadow: "0 8px 25px rgba(249, 115, 22, 0.4)",
                    "&:hover": { background: "linear-gradient(135deg, #EA580C 0%, #C2410C 100%)" },
                  }}
                >
                  Instant EMI Calculator
                </Button>
              </Stack>
            </Stack>
          </Grid>

          {/* Right Column: Hero Quick Apply & EMI Estimator Widget */}
          <Grid item xs={12} lg={5}>
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: 5,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                color: "#0F172A",
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255,255,255,0.8)",
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
                <Box>
                  <Typography variant="h6" fontWeight={900} color="#0F172A">
                    Quick Loan Estimator
                  </Typography>
                  <Typography variant="caption" color="#64748B">
                    Calculate monthly EMI & apply instantly
                  </Typography>
                </Box>
                <Chip label="Live Rate" color="success" size="small" sx={{ fontWeight: 800 }} />
              </Stack>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" fontWeight={700} color="#334155" gutterBottom>
                    Select Loan Category
                  </Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={quickLoanType}
                      onChange={(e) => setQuickLoanType(e.target.value)}
                      sx={{ borderRadius: 2.5, bgcolor: "#F8FAFC", fontWeight: 700 }}
                    >
                      <MenuItem value="BUSINESS">SME & Commercial Business Loan</MenuItem>
                      <MenuItem value="SHG">Mahila SHG & Group Loan</MenuItem>
                      <MenuItem value="EDUCATION">Education & Skill Loan</MenuItem>
                      <MenuItem value="PERSONAL">Emergency Personal Micro Loan</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={700} color="#334155">
                      Loan Amount:
                    </Typography>
                    <Typography variant="body2" fontWeight={900} color="#0F766E">
                      ₹{Number(quickAmount).toLocaleString("en-IN")}
                    </Typography>
                  </Stack>
                  <Slider
                    value={quickAmount}
                    min={10000}
                    max={500000}
                    step={10000}
                    onChange={(e, val) => setQuickAmount(val)}
                    sx={{ color: "#0F766E" }}
                  />
                </Box>

                <Paper elevation={0} sx={{ p: 2.5, bgcolor: "#F0FDF4", borderRadius: 3, border: "1px solid #BBF7D0" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="caption" color="#166534" fontWeight={800} display="block">
                        ESTIMATED MONTHLY EMI (24 MOS)
                      </Typography>
                      <Typography variant="h5" fontWeight={900} color="#15803D">
                        ₹{heroQuickEmi.toLocaleString("en-IN")} / mo
                      </Typography>
                    </Box>
                    <Chip label="11% p.a." color="success" size="small" sx={{ fontWeight: 800 }} />
                  </Stack>
                </Paper>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => navigate(isAuthenticated ? `/customer/apply-loan?amount=${quickAmount}` : "/register")}
                  sx={{
                    background: "linear-gradient(135deg, #0F766E 0%, #0D655E 100%)",
                    borderRadius: 3,
                    py: 1.5,
                    fontWeight: 800,
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(15, 118, 110, 0.4)",
                  }}
                >
                  Proceed to Application
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 3. FULL-WIDTH IMPACT STATS TICKER STRIP */}
      <Box sx={{ bgcolor: "#0F172A", color: "#FFFFFF", py: 3.5, borderTop: "1px solid #334155", borderBottom: "1px solid #334155", width: "100%" }}>
        <Box sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          <Grid container spacing={3} justifyContent="space-between" alignItems="center">
            <Grid item xs={6} sm={3} lg={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "rgba(16, 185, 129, 0.2)", color: "#34D399", width: 48, height: 48 }}>
                  <BankIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={900}>100+ Branches</Typography>
                  <Typography variant="caption" color="#94A3B8">Across Pan-India Network</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={6} sm={3} lg={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "rgba(249, 115, 22, 0.2)", color: "#FB923C", width: 48, height: 48 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={900}>₹50 Cr+ Disbursed</Typography>
                  <Typography variant="caption" color="#94A3B8">Total Credit Delivered</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={6} sm={3} lg={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "rgba(14, 165, 233, 0.2)", color: "#38BDF8", width: 48, height: 48 }}>
                  <GroupsIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={900}>25,000+ Borrowers</Typography>
                  <Typography variant="caption" color="#94A3B8">Individuals & Women SHGs</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={6} sm={3} lg={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: "rgba(168, 85, 247, 0.2)", color: "#C084FC", width: 48, height: 48 }}>
                  <SpeedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={900}>99.8% On-Time</Typography>
                  <Typography variant="caption" color="#94A3B8">Collection Disbursal Accuracy</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* 4. LOAN PRODUCTS CATALOG (Full-Width Laptop Screen View) */}
      <Box id="loan-products" sx={{ py: 8, px: { xs: 2, sm: 4, md: 6, lg: 8 }, width: "100%" }}>
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Chip label="Tailored Credit Products" color="primary" size="small" sx={{ fontWeight: 800, mb: 1 }} />
          <Typography variant="h3" fontWeight={900} color="#0F172A" gutterBottom>
            Flexible Loan Schemes for Every Need
          </Typography>
          <Typography variant="body1" color="#64748B" sx={{ maxWidth: 600, mx: "auto" }}>
            Choose from transparent, low-interest microfinance loans with quick approval and doorstep service.
          </Typography>

          {/* Product Category Filter Tabs */}
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3, flexWrap: "wrap", gap: 1 }}>
            {[
              { id: "ALL", label: "All Schemes" },
              { id: "BUSINESS", label: "Business & SME" },
              { id: "SHG", label: "Women & SHGs" },
              { id: "EDUCATION", label: "Education" },
              { id: "PERSONAL", label: "Personal Emergency" },
            ].map((cat) => (
              <Button
                key={cat.id}
                variant={productCategory === cat.id ? "contained" : "outlined"}
                onClick={() => setProductCategory(cat.id)}
                sx={{
                  borderRadius: 6,
                  px: 3,
                  py: 0.8,
                  fontWeight: 700,
                  textTransform: "none",
                  bgcolor: productCategory === cat.id ? "#0F766E" : "#FFFFFF",
                  borderColor: "#CBD5E1",
                  color: productCategory === cat.id ? "#FFFFFF" : "#475569",
                  "&:hover": { bgcolor: productCategory === cat.id ? "#0D655E" : "#F1F5F9" },
                }}
              >
                {cat.label}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* 4-Column Laptop Grid Layout */}
        <Grid container spacing={3.5} sx={{ maxWidth: 1600, mx: "auto" }}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={6} lg={3} key={product.id}>
              <Card
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                  border: "1px solid #E2E8F0",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 20px 45px rgba(15, 118, 110, 0.18)",
                    transform: "translateY(-6px)",
                  },
                }}
              >
                <Box>
                  {/* Top Color Banner */}
                  <Box sx={{ background: product.gradient, p: 2.5, color: "#FFFFFF" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Chip label={product.badge} size="small" color={product.badgeColor} sx={{ fontWeight: 800, fontSize: "0.65rem" }} />
                      <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.9 }}>
                        {product.tenure}
                      </Typography>
                    </Stack>
                    <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.2 }}>
                      {product.title}
                    </Typography>
                  </Box>

                  <CardContent sx={{ p: 2.8 }}>
                    <Typography variant="body2" color="#64748B" sx={{ mb: 2.5, minHeight: 40 }}>
                      {product.tagline}
                    </Typography>

                    <Paper elevation={0} sx={{ p: 2, bgcolor: "#F8FAFC", borderRadius: 3, mb: 2.5, border: "1px solid #E2E8F0" }}>
                      <Stack spacing={1}>
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="caption" color="#64748B" fontWeight={700}>AMOUNT RANGE</Typography>
                          <Typography variant="body2" fontWeight={800} color="#0F766E">{product.amountRange}</Typography>
                        </Box>
                        <Divider />
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="caption" color="#64748B" fontWeight={700}>INTEREST RATE</Typography>
                          <Typography variant="body2" fontWeight={800} color="#0F172A">{product.interest}</Typography>
                        </Box>
                      </Stack>
                    </Paper>

                    <Typography variant="caption" fontWeight={800} color="#0F172A" display="block" sx={{ mb: 1.5 }}>
                      KEY BENEFITS & FEATURES
                    </Typography>

                    <Stack spacing={1}>
                      {product.features.map((feat, fIdx) => (
                        <Box key={`feat-${fIdx}`} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                          <CheckCircleIcon sx={{ fontSize: 16, color: "#10B981", mt: 0.3 }} />
                          <Typography variant="caption" color="#334155" fontWeight={600}>
                            {feat}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Box>

                <Box sx={{ p: 2.5, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate(isAuthenticated ? "/customer/apply-loan" : "/register")}
                    sx={{
                      background: product.gradient,
                      borderRadius: 3,
                      py: 1.3,
                      fontWeight: 800,
                      textTransform: "none",
                      boxShadow: "0 4px 14px rgba(15, 118, 110, 0.3)",
                    }}
                  >
                    Apply Scheme
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 5. WORKFLOW STEPS SECTION */}
      <Box id="how-it-works" sx={{ bgcolor: "#FFFFFF", py: 8, px: { xs: 2, sm: 4, md: 6, lg: 8 }, borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0", width: "100%" }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Chip label="Simple 4-Step Process" color="success" size="small" sx={{ fontWeight: 800, mb: 1 }} />
          <Typography variant="h3" fontWeight={900} color="#0F172A" gutterBottom>
            How PNRG Loan Disbursal Works
          </Typography>
          <Typography variant="body1" color="#64748B">
            From digital registration to doorstep loan disbursal in 4 simple steps
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ maxWidth: 1600, mx: "auto" }}>
          {workflowSteps.map((ws, sIdx) => (
            <Grid item xs={12} sm={6} md={3} key={`ws-${sIdx}`}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  border: "1px solid #E2E8F0",
                  height: "100%",
                  bgcolor: "#F8FAFC",
                  position: "relative",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "#0F766E",
                    transform: "translateY(-6px)",
                    boxShadow: "0 12px 30px rgba(15, 118, 110, 0.12)",
                  },
                }}
              >
                <Typography variant="h3" fontWeight={900} color="#E2E8F0" sx={{ position: "absolute", top: 16, right: 20 }}>
                  {ws.step}
                </Typography>
                <Box sx={{ mb: 2 }}>{ws.icon}</Box>
                <Typography variant="h6" fontWeight={900} color="#0F172A" gutterBottom>
                  {ws.title}
                </Typography>
                <Typography variant="body2" color="#64748B" sx={{ lineHeight: 1.6 }}>
                  {ws.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 6. BORROWER TESTIMONIALS CAROUSEL */}
      <Box sx={{ py: 8, px: { xs: 2, sm: 4, md: 6, lg: 8 }, width: "100%", bgcolor: "#F8FAFC" }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Chip label="Real Borrower Stories" color="secondary" size="small" sx={{ fontWeight: 800, mb: 1 }} />
          <Typography variant="h3" fontWeight={900} color="#0F172A" gutterBottom>
            Trusted by Thousands Across India
          </Typography>
        </Box>

        <Grid container spacing={3.5} sx={{ maxWidth: 1400, mx: "auto" }}>
          {testimonials.map((t, idx) => (
            <Grid item xs={12} md={4} key={`test-${idx}`}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: 4,
                  border: "1px solid #E2E8F0",
                  bgcolor: "#FFFFFF",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Stack direction="row" spacing={0.5} sx={{ mb: 2, color: "#F59E0B" }}>
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} fontSize="small" />
                    ))}
                  </Stack>
                  <Typography variant="body2" color="#334155" sx={{ fontStyle: "italic", lineHeight: 1.7, mb: 3 }}>
                    "{t.comment}"
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={t.image} sx={{ width: 48, height: 48, border: "2px solid #0F766E" }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={900} color="#0F172A">
                      {t.name}
                    </Typography>
                    <Typography variant="caption" color="#64748B">
                      {t.role}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 7. EMI CALCULATOR MODAL */}
      <Dialog
        open={emiModalOpen}
        onClose={() => setEmiModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 5, p: 2 } } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CalculateIcon sx={{ color: "#F97316", fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Interactive Loan EMI Calculator
              </Typography>
              <Typography variant="caption" color="#64748B">
                Adjust sliders to see instant monthly repayment EMI
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={() => setEmiModalOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" fontWeight={800} color="#0F172A" gutterBottom>
                    Required Loan Amount: <span style={{ color: "#0F766E" }}>₹{Number(loanAmount).toLocaleString("en-IN")}</span>
                  </Typography>
                  <Slider
                    value={loanAmount}
                    min={10000}
                    max={2500000}
                    step={10000}
                    onChange={(e, val) => setLoanAmount(val)}
                    sx={{ color: "#0F766E" }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight={800} color="#0F172A" gutterBottom>
                    Tenure Duration: <span style={{ color: "#0F766E" }}>{tenureMonths} Months</span>
                  </Typography>
                  <Slider
                    value={tenureMonths}
                    min={6}
                    max={60}
                    step={6}
                    onChange={(e, val) => setTenureMonths(val)}
                    sx={{ color: "#0F766E" }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight={800} color="#0F172A" gutterBottom>
                    Interest Rate (% p.a.): <span style={{ color: "#F97316" }}>{interestRate}%</span>
                  </Typography>
                  <Slider
                    value={interestRate}
                    min={8}
                    max={24}
                    step={0.5}
                    onChange={(e, val) => setInterestRate(val)}
                    sx={{ color: "#F97316" }}
                  />
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 3, bgcolor: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 4, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="caption" color="#166534" fontWeight={800} display="block" gutterBottom>
                    CALCULATED MONTHLY REPAYMENT
                  </Typography>
                  <Typography variant="h3" fontWeight={900} color="#15803D" sx={{ mb: 2 }}>
                    ₹{monthlyEmi.toLocaleString("en-IN")}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="#334155" fontWeight={700}>Principal Amount:</Typography>
                      <Typography variant="body2" fontWeight={800} color="#0F172A">₹{Number(loanAmount).toLocaleString("en-IN")}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="#334155" fontWeight={700}>Total Interest Payable:</Typography>
                      <Typography variant="body2" fontWeight={800} color="#C2410C">₹{totalInterest.toLocaleString("en-IN")}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="#334155" fontWeight={700}>Total Repayment Value:</Typography>
                      <Typography variant="body2" fontWeight={900} color="#0F172A">₹{totalPayable.toLocaleString("en-IN")}</Typography>
                    </Box>
                  </Stack>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    setEmiModalOpen(false);
                    navigate(isAuthenticated ? "/customer/apply-loan" : "/register");
                  }}
                  sx={{
                    bgcolor: "#0F766E",
                    "&:hover": { bgcolor: "#0D655E" },
                    borderRadius: 3,
                    py: 1.2,
                    fontWeight: 800,
                    mt: 3,
                  }}
                >
                  Apply for this Loan
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* 8. CONTACT HQ & RICH FOOTER */}
      <Box id="contact-section" sx={{ bgcolor: "#0F172A", color: "#94A3B8", pt: 8, pb: 4, width: "100%" }}>
        <Box sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 } }}>
          <Grid container spacing={4} sx={{ mb: 6, maxWidth: 1600, mx: "auto" }}>
            <Grid item xs={12} md={4}>
              <Stack direction="row" alignItems="center" spacing={1.8} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    background: "linear-gradient(135deg, #0F766E 0%, #F97316 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    fontWeight: 900,
                    fontSize: "1.2rem",
                  }}
                >
                  P
                </Box>
                <Typography variant="h6" fontWeight={900} color="#FFFFFF">
                  PNRG FINANCE ERP
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.7, mb: 3 }}>
                Complete microfinance operational, customer loan management, SHG group financing & document engine. Empowering communities with transparent financial access.
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle1" fontWeight={800} color="#FFFFFF" gutterBottom>
                Quick Links & Operations
              </Typography>
              <Stack spacing={1.5}>
                <Typography variant="body2" sx={{ cursor: "pointer", "&:hover": { color: "#FFFFFF" } }} onClick={() => navigate("/login")}>
                  Customer & Staff Portal Login
                </Typography>
                <Typography variant="body2" sx={{ cursor: "pointer", "&:hover": { color: "#FFFFFF" } }} onClick={() => navigate("/register")}>
                  New Customer Registration & eKYC
                </Typography>
                <Typography variant="body2" sx={{ cursor: "pointer", "&:hover": { color: "#FFFFFF" } }} onClick={() => setEmiModalOpen(true)}>
                  Interactive Loan EMI Calculator
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="subtitle1" fontWeight={800} color="#FFFFFF" gutterBottom>
                Central HQ Contact
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <LocationIcon sx={{ color: "#0F766E" }} />
                  <Typography variant="body2">Head Office Central Operations, PNRG Finance ERP Ltd.</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <EmailIcon sx={{ color: "#0F766E" }} />
                  <Typography variant="body2">admin@pnrgfinance.com</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <PhoneIcon sx={{ color: "#0F766E" }} />
                  <Typography variant="body2">+91 1800-PNRG-LOAN (Toll-Free Support)</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: "#334155", mb: 4 }} />

          <Typography variant="body2" textAlign="center" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} PNRG Finance Microfinance ERP Systems Ltd. All rights reserved. Built with secure microfinance technology.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
