import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Icons
import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import WarningIcon from "@mui/icons-material/Warning";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import BusinessIcon from "@mui/icons-material/Business";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AddIcon from "@mui/icons-material/Add";
import ShieldIcon from "@mui/icons-material/Shield";
import LocationOnIcon from "@mui/icons-material/LocationOn";

import dashboardService from "../../services/dashboard.service";
import financeService from "../../services/finance.service";
import loanApplicationService from "../../services/loanApplication.service";
import groupService from "../../services/group.service";
import useAuth from "../../hooks/useAuth";
import CustomerDashboard from "../customer-portal/CustomerDashboard";

const COLORS = ["#0F766E", "#0284C7", "#D97706", "#DC2626", "#7C3AED", "#059669"];

const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleName = (user?.role_name || user?.role || "").toUpperCase().replace(/\s+/g, "_");

  // If customer, render Customer Portal dashboard unchanged
  if (roleName === "CUSTOMER") {
    return <CustomerDashboard />;
  }

  // Fetch Base Org Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 30000,
  });

  // Render role-specific dashboard based on roleName
  switch (roleName) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return <AdminDashboard stats={stats} loading={statsLoading} navigate={navigate} user={user} />;

    case "BRANCH_MANAGER":
      return <BranchManagerDashboard stats={stats} loading={statsLoading} navigate={navigate} user={user} />;

    case "FIELD_OFFICER":
      return <FieldOfficerDashboard stats={stats} loading={statsLoading} navigate={navigate} user={user} />;

    case "ACCOUNTANT":
      return <AccountantDashboard stats={stats} loading={statsLoading} navigate={navigate} user={user} />;

    default:
      return <AdminDashboard stats={stats} loading={statsLoading} navigate={navigate} user={user} />;
  }
}

/* ==========================================================================
   1. SUPER ADMIN / ADMIN DASHBOARD
   ========================================================================== */
function AdminDashboard({ stats, loading, navigate, user }) {
  const firstName = user?.first_name || user?.firstName || "Admin";

  const cards = [
    {
      title: "Total Customers",
      value: stats?.totalCustomers ?? 0,
      subtext: "Registered borrowers",
      color: "#0F766E",
      bg: "#F0FDF4",
      icon: <PeopleIcon sx={{ fontSize: 28, color: "#0F766E" }} />,
    },
    {
      title: "Active Loans",
      value: stats?.activeLoans ?? 0,
      subtext: "Earning interest",
      color: "#0284C7",
      bg: "#E0F2FE",
      icon: <AccountBalanceIcon sx={{ fontSize: 28, color: "#0284C7" }} />,
    },
    {
      title: "Today's Collection",
      value: formatCurrency(stats?.todayCollection),
      subtext: `Monthly: ${formatCurrency(stats?.monthlyCollection)}`,
      color: "#D97706",
      bg: "#FEF3C7",
      icon: <MonetizationOnIcon sx={{ fontSize: 28, color: "#D97706" }} />,
    },
    {
      title: "Overdue / NPA Loans",
      value: stats?.overdueLoans ?? 0,
      subtext: "Requires follow-up",
      color: "#DC2626",
      bg: "#FEF2F2",
      icon: <WarningIcon sx={{ fontSize: 28, color: "#DC2626" }} />,
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 10 }}>
        <CircularProgress sx={{ color: "#0F766E" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Banner */}
      <Box
        sx={{
          p: 3,
          mb: 3.5,
          borderRadius: 3,
          background: "linear-gradient(135deg, #0F766E 0%, #115E59 100%)",
          color: "#FFFFFF",
          boxShadow: "0 10px 20px -5px rgba(15, 118, 110, 0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <ShieldIcon sx={{ color: "#5EEAD4", fontSize: 22 }} />
            <Chip
              label="Executive Control Hub"
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#FFFFFF", fontWeight: 700, fontSize: "0.72rem" }}
            />
          </Stack>
          <Typography variant="h5" fontWeight={800}>
            Welcome back, {firstName}!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Real-time organizational performance, branch analytics, and portfolio monitoring.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            onClick={() => navigate("/loan-applications")}
            sx={{
              bgcolor: "#FFFFFF",
              color: "#0F766E",
              fontWeight: 700,
              "&:hover": { bgcolor: "#CCFBF1" },
              borderRadius: 2,
              px: 2.5,
            }}
          >
            Review Pending Loans ({stats?.pendingApplications || 0})
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {cards.map((c) => (
          <Grid key={c.title} item xs={12} sm={6} md={3}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                border: "1px solid #E2E8F0",
                transition: "transform 0.2s ease-in-out, boxShadow 0.2s ease-in-out",
                "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 20px rgba(0,0,0,0.08)" },
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={700}>
                    {c.title}
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: c.bg }}>{c.icon}</Box>
                </Stack>
                <Typography variant="h4" fontWeight={800} sx={{ color: c.color, mb: 0.5 }}>
                  {c.value}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  {c.subtext}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts & Analytics */}
      <Grid container spacing={3} sx={{ mb: 3.5 }}>
        {/* Monthly Collection Trend */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#0F172A">
                    6-Month Collection Trend
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Monthly total loan repayments across all branches
                  </Typography>
                </Box>
                <Chip label="Real-time Sync" size="small" sx={{ bgcolor: "#F0FDF4", color: "#16A34A", fontWeight: 700 }} />
              </Stack>

              {stats?.monthlyChart?.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={stats.monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748B" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748B" }} />
                    <RechartsTooltip formatter={(val) => formatCurrency(val)} />
                    <Bar dataKey="total" fill="#0F766E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}>
                  No collection data recorded yet.
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Action Command Hub */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} color="#0F172A" sx={{ mb: 2 }}>
                Quick Command Hub
              </Typography>
              <Stack spacing={1.5}>
                {[
                  { label: "Manage Staff & Users", path: "/users", color: "#0F766E", bg: "#F0FDF4", icon: <PeopleIcon /> },
                  { label: "Loan Applications", path: "/loan-applications", color: "#0284C7", bg: "#E0F2FE", icon: <PendingActionsIcon /> },
                  { label: "Loan Products Setup", path: "/loan-products", color: "#D97706", bg: "#FEF3C7", icon: <AccountBalanceIcon /> },
                  { label: "Cash Book Ledger", path: "/cashbook", color: "#059669", bg: "#ECFDF5", icon: <AccountBalanceWalletIcon /> },
                  { label: "System Audit Logs", path: "/audit-logs", color: "#7C3AED", bg: "#F3E8FF", icon: <ShieldIcon /> },
                  { label: "System Settings", path: "/settings", color: "#475569", bg: "#F1F5F9", icon: <CheckCircleIcon /> },
                ].map((act) => (
                  <Button
                    key={act.label}
                    fullWidth
                    onClick={() => navigate(act.path)}
                    startIcon={act.icon}
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    sx={{
                      justifyContent: "space-between",
                      color: act.color,
                      bgcolor: act.bg,
                      fontWeight: 700,
                      textTransform: "none",
                      py: 1.2,
                      px: 2,
                      borderRadius: 2,
                      border: `1px solid ${act.bg}`,
                      "&:hover": { filter: "brightness(0.96)" },
                    }}
                  >
                    {act.label}
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Branch Performance Matrix */}
      <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#0F172A">
                Branch Performance Matrix
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Overview of active loans, portfolio size, and monthly performance per branch
              </Typography>
            </Box>
            <Button size="small" onClick={() => navigate("/branches")} endIcon={<ArrowForwardIcon />}>
              Manage Branches
            </Button>
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                <TableCell sx={{ fontWeight: 700 }}>Branch Name</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Total Customers</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Active Loans</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Portfolio Size</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Monthly Collection</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats?.branchPerformance?.length > 0 ? (
                stats.branchPerformance.map((b) => (
                  <TableRow key={b.branch_id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <BusinessIcon sx={{ fontSize: 18, color: "#0F766E" }} />
                        <Typography variant="body2" fontWeight={700}>{b.branch_name}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">{b.total_customers}</TableCell>
                    <TableCell align="center">
                      <Chip label={`${b.active_loans} Active`} size="small" sx={{ bgcolor: "#E0F2FE", color: "#0369A1", fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "#0F766E" }}>
                      {formatCurrency(b.portfolio_size)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "#16A34A" }}>
                      {formatCurrency(b.monthly_collection)}
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" onClick={() => navigate(`/branches`)} sx={{ textTransform: "none", fontWeight: 600 }}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: "#64748B" }}>
                    No branch data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}

/* ==========================================================================
   2. BRANCH MANAGER DASHBOARD
   ========================================================================== */
function BranchManagerDashboard({ stats, loading, navigate, user }) {
  const branchName = user?.branch_name || user?.branch || "Branch Office";
  const firstName = user?.first_name || user?.firstName || "Manager";

  // Fetch Pending Applications for Branch
  const { data: pendingData } = useQuery({
    queryKey: ["pendingLoanApps"],
    queryFn: () => loanApplicationService.getAll({ status: "PENDING" }),
  });

  // Fetch Branch Groups
  const { data: groupData } = useQuery({
    queryKey: ["branchGroups"],
    queryFn: () => groupService.getAll(),
  });

  const pendingApps = pendingData?.loanApplications || [];
  const groups = groupData?.groups || [];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 10 }}>
        <CircularProgress sx={{ color: "#0F766E" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Banner */}
      <Box
        sx={{
          p: 3,
          mb: 3.5,
          borderRadius: 3,
          background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)",
          color: "#FFFFFF",
          boxShadow: "0 10px 20px -5px rgba(2, 132, 199, 0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <BusinessIcon sx={{ color: "#BAE6FD", fontSize: 22 }} />
            <Chip
              label={`Branch Manager • ${branchName}`}
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#FFFFFF", fontWeight: 700, fontSize: "0.72rem" }}
            />
          </Stack>
          <Typography variant="h5" fontWeight={800}>
            Hello, {firstName}!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Branch operational overview, loan approvals, field officers, and group portfolio.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            onClick={() => navigate("/groups")}
            sx={{ bgcolor: "#FFFFFF", color: "#0369A1", fontWeight: 700, "&:hover": { bgcolor: "#E0F2FE" }, borderRadius: 2 }}
          >
            Manage SHG Groups ({groups.length})
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={700}>Branch Customers</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#0F766E", my: 0.5 }}>
                {stats?.totalCustomers ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">Registered in branch</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={700}>Active Loans</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#0284C7", my: 0.5 }}>
                {stats?.activeLoans ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">Disbursed & Active</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={700}>Pending Approvals</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#D97706", my: 0.5 }}>
                {pendingApps.length}
              </Typography>
              <Typography variant="caption" color="#D97706" fontWeight={700}>Awaiting Manager Sign-off</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={700}>Today's Collection</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#16A34A", my: 0.5 }}>
                {formatCurrency(stats?.todayCollection)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Branch daily recovery</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Pending Loan Approvals */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700} color="#0F172A">
                    Pending Loan Applications
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Applications submitted by field officers requiring review
                  </Typography>
                </Box>
                <Button size="small" onClick={() => navigate("/loan-applications")}>View All</Button>
              </Stack>

              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                    <TableCell sx={{ fontWeight: 700 }}>App No</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Borrower</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingApps.slice(0, 5).map((app) => (
                    <TableRow key={app.application_id || app.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: "#0F766E" }}>
                        {app.application_number || `APP-${app.id}`}
                      </TableCell>
                      <TableCell>{app.customer_name || app.first_name || "Applicant"}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatCurrency(app.applied_amount || app.requested_amount)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label="PENDING" size="small" sx={{ bgcolor: "#FEF3C7", color: "#B45309", fontWeight: 700 }} />
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="outlined" onClick={() => navigate("/loan-applications")} sx={{ textTransform: "none" }}>
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingApps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3, color: "#64748B" }}>
                        No pending loan applications for review.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Branch SHG / JLG Groups Overview */}
        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700} color="#0F172A">
                  Active SHG Groups
                </Typography>
                <Button size="small" onClick={() => navigate("/groups")}>View Groups</Button>
              </Stack>

              <Stack spacing={1.5}>
                {groups.slice(0, 5).map((g) => (
                  <Box
                    key={g.group_id}
                    sx={{ p: 1.5, borderRadius: 2, bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                        {g.group_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Meeting: {g.meeting_day || "Weekly"} · Members: {g.member_count || 0}
                      </Typography>
                    </Box>
                    <Chip label={g.status || "ACTIVE"} size="small" sx={{ bgcolor: "#F0FDF4", color: "#16A34A", fontWeight: 700 }} />
                  </Box>
                ))}
                {groups.length === 0 && (
                  <Typography variant="body2" color="#64748B" align="center" sx={{ py: 3 }}>
                    No SHG groups created yet.
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ==========================================================================
   3. FIELD OFFICER DASHBOARD
   ========================================================================== */
function FieldOfficerDashboard({ stats, loading, navigate, user }) {
  const firstName = user?.first_name || user?.firstName || "Officer";
  const branchName = user?.branch_name || user?.branch || "Field Office";

  // Fetch Groups assigned / available
  const { data: groupData } = useQuery({
    queryKey: ["fieldGroups"],
    queryFn: () => groupService.getAll(),
  });

  const groups = groupData?.groups || [];

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 10 }}>
        <CircularProgress sx={{ color: "#0F766E" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Banner */}
      <Box
        sx={{
          p: 3,
          mb: 3.5,
          borderRadius: 3,
          background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
          color: "#FFFFFF",
          boxShadow: "0 10px 20px -5px rgba(5, 150, 105, 0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <LocationOnIcon sx={{ color: "#A7F3D0", fontSize: 22 }} />
            <Chip
              label={`Field Duty • ${branchName}`}
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#FFFFFF", fontWeight: 700, fontSize: "0.72rem" }}
            />
          </Stack>
          <Typography variant="h5" fontWeight={800}>
            Good day, {firstName}!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Today's collection targets, center meetings, and group visits.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            onClick={() => navigate("/collections")}
            sx={{ bgcolor: "#FFFFFF", color: "#047857", fontWeight: 700, "&:hover": { bgcolor: "#ECFDF5" }, borderRadius: 2 }}
          >
            Log EMI Collection
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={700}>Assigned SHG Groups</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#0F766E", my: 0.5 }}>
                {groups.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Active field centers</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={700}>Active Borrowers</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#0284C7", my: 0.5 }}>
                {stats?.totalCustomers ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">In your coverage area</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={700}>Today's Target</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#D97706", my: 0.5 }}>
                {formatCurrency(stats?.todayCollection || 15000)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Expected EMI collections</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={700}>Collected Today</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#16A34A", my: 0.5 }}>
                {formatCurrency(stats?.todayCollection)}
              </Typography>
              <Typography variant="caption" color="#16A34A" fontWeight={700}>Logged in system</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Field Officer Group List */}
      <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#0F172A">
                Assigned Field Groups & Meetings
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Self Help Groups (SHGs) under your direct supervision
              </Typography>
            </Box>
            <Button size="small" variant="contained" onClick={() => navigate("/groups")} startIcon={<AddIcon />}>
              Add Group
            </Button>
          </Stack>

          <Grid container spacing={2}>
            {groups.map((g) => (
              <Grid key={g.group_id} item xs={12} sm={6} md={4}>
                <Card sx={{ borderRadius: 2, border: "1px solid #E2E8F0", bgcolor: "#F8FAFC" }}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
                        {g.group_name}
                      </Typography>
                      <Chip label={g.meeting_day || "Weekly"} size="small" sx={{ bgcolor: "#E0F2FE", color: "#0369A1", fontWeight: 700 }} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Leader: {g.leader_name || "N/A"} ({g.leader_phone || "No phone"})
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                      Members: {g.member_count || 0} · Code: {g.group_code || `GRP-${g.group_id}`}
                    </Typography>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      onClick={() => navigate("/collections")}
                      sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                      Record Group Collection
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {groups.length === 0 && (
              <Grid item xs={12}>
                <Typography color="#64748B" align="center" sx={{ py: 4 }}>
                  No groups currently assigned to you.
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

/* ==========================================================================
   4. ACCOUNTANT DASHBOARD
   ========================================================================== */
function AccountantDashboard({ stats, loading, navigate, user }) {
  const firstName = user?.first_name || user?.firstName || "Accountant";
  const branchName = user?.branch_name || user?.branch || "Accounts Desk";

  // Fetch Cash Book Data
  const { data: cashBookData } = useQuery({
    queryKey: ["dashboardCashBook"],
    queryFn: () => financeService.getCashBook({ limit: 10 }),
  });

  const cashEntries = cashBookData?.entries || [];
  const cashSummary = cashBookData?.summary || {};

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 10 }}>
        <CircularProgress sx={{ color: "#0F766E" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      {/* Banner */}
      <Box
        sx={{
          p: 3,
          mb: 3.5,
          borderRadius: 3,
          background: "linear-gradient(135deg, #0F766E 0%, #047857 100%)",
          color: "#FFFFFF",
          boxShadow: "0 10px 20px -5px rgba(15, 118, 110, 0.25)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <AccountBalanceWalletIcon sx={{ color: "#A7F3D0", fontSize: 22 }} />
            <Chip
              label={`Accounts & Finance Desk • ${branchName}`}
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#FFFFFF", fontWeight: 700, fontSize: "0.72rem" }}
            />
          </Stack>
          <Typography variant="h5" fontWeight={800}>
            Financial Control, {firstName}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            Live cash book ledger, daily inflows/outflows, expenses, and fee income.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            onClick={() => navigate("/cashbook")}
            sx={{ bgcolor: "#FFFFFF", color: "#0F766E", fontWeight: 700, "&:hover": { bgcolor: "#F0FDF4" }, borderRadius: 2 }}
          >
            Open Cash Book
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/expenses")}
            sx={{ color: "#FFFFFF", borderColor: "rgba(255,255,255,0.5)", fontWeight: 700, "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }, borderRadius: 2 }}
          >
            Log Expense
          </Button>
        </Stack>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={700}>Total Cash Inflow</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#16A34A", my: 0.5 }}>
                {formatCurrency(cashSummary.totalInflow || stats?.todayCollection)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Collections & Income</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={700}>Total Outflow</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#DC2626", my: 0.5 }}>
                {formatCurrency(cashSummary.totalOutflow || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Disbursements & Expenses</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={700}>Net Cash Position</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#0F766E", my: 0.5 }}>
                {formatCurrency(cashSummary.netBalance || (stats?.todayCollection || 0))}
              </Typography>
              <Typography variant="caption" color="text.secondary">Current Cash in Hand</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={700}>Monthly Collections</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ color: "#0284C7", my: 0.5 }}>
                {formatCurrency(stats?.monthlyCollection)}
              </Typography>
              <Typography variant="caption" color="text.secondary">MTD Total</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Live Cash Book Stream */}
      <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#0F172A">
                Recent Cash Book Ledger Entries
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Unified real-time feed of collections, loan disbursements, expenses, and fee income
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" onClick={() => navigate("/expenses")}>Add Expense</Button>
              <Button size="small" variant="contained" onClick={() => navigate("/income")}>Add Income</Button>
            </Stack>
          </Stack>

          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category / Source</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>Mode</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cashEntries.slice(0, 8).map((entry, idx) => {
                const isInflow = entry.entry_type === "INFLOW";
                return (
                  <TableRow key={idx} hover>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {entry.entry_date ? String(entry.entry_date).split("T")[0] : "Today"}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>{entry.category || entry.particulars || "Transaction"}</Typography>
                      <Typography variant="caption" color="text.secondary">{entry.description || "N/A"}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={isInflow ? "INFLOW" : "OUTFLOW"}
                        size="small"
                        sx={{
                          bgcolor: isInflow ? "#ECFDF5" : "#FEF2F2",
                          color: isInflow ? "#047857" : "#DC2626",
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 800, color: isInflow ? "#16A34A" : "#DC2626" }}>
                      {isInflow ? "+" : "-"}{formatCurrency(entry.amount)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={entry.payment_method || "CASH"} size="small" variant="outlined" />
                    </TableCell>
                  </TableRow>
                );
              })}
              {cashEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3, color: "#64748B" }}>
                    No cash book transactions logged today yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}
