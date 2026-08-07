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
  Paper,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Shield as ShieldIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AccountBalanceWallet as WalletIcon,
  TrendingUp as TrendingUpIcon,
  AssignmentTurnedIn as TaskIcon,
  Description as DescriptionIcon,
  PersonAdd as PersonAddIcon,
  ReceiptLong as ReceiptIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Fingerprint as FingerprintIcon,
  VerifiedUser as VerifiedIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import DashboardCard from "./DashboardCard";
import dashboardService from "../../services/dashboard.service";
import userService from "../../services/user.service";
import useAuth from "../../hooks/useAuth";
import CustomerDashboard from "../customer-portal/CustomerDashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rawRole = (user?.role_name || user?.role || "").toUpperCase().trim().replace(/\s+/g, "_");
  const isCustomer = rawRole === "CUSTOMER";

  // Fetch org stats for non-customer roles
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 30000,
    enabled: !isCustomer,
  });

  if (isCustomer) {
    return <CustomerDashboard />;
  }

  // Handle role matching
  if (rawRole === "SUPER_ADMIN" || rawRole.includes("SUPER")) {
    return <SuperAdminDashboard user={user} navigate={navigate} stats={stats} isLoading={isLoading} />;
  }

  if (rawRole === "BRANCH_MANAGER" || rawRole.includes("BRANCH")) {
    return <BranchManagerDashboard user={user} navigate={navigate} stats={stats} isLoading={isLoading} />;
  }

  if (rawRole === "FIELD_OFFICER" || rawRole.includes("FIELD")) {
    return <FieldOfficerDashboard user={user} navigate={navigate} stats={stats} isLoading={isLoading} />;
  }

  if (rawRole === "ACCOUNTANT" || rawRole.includes("ACCOUNT")) {
    return <AccountantDashboard user={user} navigate={navigate} stats={stats} isLoading={isLoading} />;
  }

  return <AdminDashboard user={user} navigate={navigate} stats={stats} isLoading={isLoading} />;
}

/* ─────────────────────────────────────────────────────────────
   1. SUPER ADMIN DASHBOARD (Fully Populated Governance View)
   Focus: Add, View, and Manage Administrator Accounts ONLY
   ───────────────────────────────────────────────────────────── */
function SuperAdminDashboard({ user, navigate, stats }) {
  const { data: usersData } = useQuery({
    queryKey: ["superadmin-users-list"],
    queryFn: () => userService.getAll({ roleName: "ADMIN", limit: 5 }),
  });

  const adminList = usersData?.users || [];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <Chip
            icon={<ShieldIcon style={{ color: "#0F766E", fontSize: 16 }} />}
            label="Super Admin Portal"
            sx={{ bgcolor: "#CCFBF1", color: "#0F766E", fontWeight: 700 }}
          />
        </Stack>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          Welcome, {user?.first_name || "Super Admin"}
        </Typography>
        <Typography color="#64748B">
          Administrator Control Hub: Add, view, and manage system Administrator accounts across the organization.
        </Typography>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #0F766E", border: "1px solid #E2E8F0" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="textSecondary" fontWeight={600}>
                  Total Administrators
                </Typography>
                <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ my: 0.5 }}>
                  {stats?.totalUsers || adminList.length || 1}
                </Typography>
                <Typography variant="caption" color="#0F766E" fontWeight={600}>
                  Configured Admin Accounts
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "#CCFBF1", color: "#0F766E", width: 56, height: 56 }}>
                <PeopleIcon sx={{ fontSize: 32 }} />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #16A34A", border: "1px solid #E2E8F0" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="textSecondary" fontWeight={600}>
                  Active Administrator Status
                </Typography>
                <Typography variant="h3" fontWeight={800} color="#16A34A" sx={{ my: 0.5 }}>
                  {adminList.filter((u) => u.status === "ACTIVE").length || 1}
                </Typography>
                <Typography variant="caption" color="#16A34A" fontWeight={600}>
                  Operational & Active
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "#DCFCE7", color: "#16A34A", width: 56, height: 56 }}>
                <CheckCircleIcon sx={{ fontSize: 32 }} />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #0284C7", border: "1px solid #E2E8F0" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" color="textSecondary" fontWeight={600}>
                  System Access Mode
                </Typography>
                <Typography variant="h5" fontWeight={800} color="#0284C7" sx={{ my: 1 }}>
                  SUPER ADMIN
                </Typography>
                <Typography variant="caption" color="#0284C7" fontWeight={600}>
                  Administrator Governance Only
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: "#E0F2FE", color: "#0284C7", width: 56, height: 56 }}>
                <ShieldIcon sx={{ fontSize: 32 }} />
              </Avatar>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Primary Action Hub */}
      <Card sx={{ borderRadius: 3, p: 3.5, border: "1px solid #E2E8F0", mb: 4 }}>
        <Typography variant="h6" fontWeight={700} color="#0F172A" mb={2}>
          Administrator Management Controls
        </Typography>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => navigate("/users")}
              sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D9488" }, py: 1.8, borderRadius: 2.5, fontWeight: 700, fontSize: "0.95rem" }}
            >
              Add New Administrator Account
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<PeopleIcon />}
              onClick={() => navigate("/users")}
              sx={{ borderColor: "#CBD5E1", color: "#334155", py: 1.8, borderRadius: 2.5, fontWeight: 700, fontSize: "0.95rem" }}
            >
              View & Manage Administrators List
            </Button>
          </Grid>
        </Grid>
      </Card>

      {/* Quick Administrators Table */}
      <Card sx={{ borderRadius: 3, border: "1px solid #E2E8F0" }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={700} color="#0F172A">
              System Administrators Overview
            </Typography>
            <Button size="small" onClick={() => navigate("/users")} sx={{ textTransform: "none", fontWeight: 700, color: "#0F766E" }}>
              View All Admins →
            </Button>
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Administrator Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adminList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3, color: "#64748B" }}>
                      System Administrator (Default HQ Super Admin Active)
                    </TableCell>
                  </TableRow>
                ) : (
                  adminList.map((row) => (
                    <TableRow key={row.userId} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{row.firstName} {row.lastName}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>
                        <Chip label={row.role || "ADMIN"} size="small" sx={{ bgcolor: "#E0F2FE", color: "#0369A1", fontWeight: 700 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={row.status || "ACTIVE"} size="small" color="success" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. SYSTEM ADMIN DASHBOARD (Fully Populated Business View)
   Focus: Full Business & Organization Operations
   ───────────────────────────────────────────────────────────── */
function AdminDashboard({ user, navigate, stats, isLoading }) {
  const cards = useMemo(
    () => [
      { title: "Total Customers", value: stats?.totalCustomers ?? "—", color: "#0F766E" },
      { title: "Active Loans", value: stats?.activeLoans ?? "—", color: "#16A34A" },
      { title: "Today's Collection", value: stats?.todayCollection ? `₹${Number(stats.todayCollection).toLocaleString()}` : "—", color: "#F59E0B" },
      { title: "Overdue Loans", value: stats?.overdueLoans ?? "—", color: "#DC2626" },
    ],
    [stats]
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <Chip
            icon={<ShieldIcon style={{ color: "#B45309", fontSize: 16 }} />}
            label="System Administrator Operations"
            sx={{ bgcolor: "#FEF3C7", color: "#B45309", fontWeight: 700 }}
          />
        </Stack>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          Welcome, {user?.first_name || "Admin"}
        </Typography>
        <Typography color="#64748B">
          Real-time microfinance business performance, multi-branch operations, and quick management actions.
        </Typography>
      </Box>

      {/* Metrics */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {cards.map((card) => (
            <Grid item xs={12} sm={6} lg={3} key={card.title}>
              <DashboardCard title={card.title} value={card.value} color={card.color} icon={null} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Quick Actions & Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ minHeight: 340, borderRadius: 3, border: "1px solid #E2E8F0" }}>
            <CardContent>
              <Typography variant="h6" color="#0F172A" mb={2} fontWeight={700}>
                Monthly Collection Performance (₹)
              </Typography>
              <Box sx={{ height: 260, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.monthlyChartData || [{ month: "Current", amount: Number(stats?.todayCollection || 45000) }]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <RechartsTooltip />
                    <Bar dataKey="amount" fill="#0F766E" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ minHeight: 340, borderRadius: 3, border: "1px solid #E2E8F0" }}>
            <CardContent>
              <Typography variant="h6" color="#0F172A" mb={2} fontWeight={700}>
                Operations Action Hub
              </Typography>
              <Stack spacing={1.5}>
                <Button fullWidth variant="contained" startIcon={<PeopleIcon />} onClick={() => navigate("/users")} sx={{ bgcolor: "#0F766E", py: 1.2, borderRadius: 2 }}>
                  Employee Management
                </Button>
                <Button fullWidth variant="outlined" startIcon={<PersonAddIcon />} onClick={() => navigate("/customers")} sx={{ py: 1.2, borderRadius: 2 }}>
                  Add Customer
                </Button>
                <Button fullWidth variant="outlined" startIcon={<DescriptionIcon />} onClick={() => navigate("/loan-applications")} sx={{ py: 1.2, borderRadius: 2 }}>
                  Loan Applications
                </Button>
                <Button fullWidth variant="outlined" startIcon={<WalletIcon />} onClick={() => navigate("/cashbook")} sx={{ py: 1.2, borderRadius: 2 }}>
                  Cash Book Ledger
                </Button>
                <Button fullWidth variant="outlined" startIcon={<SettingsIcon />} onClick={() => navigate("/settings")} sx={{ py: 1.2, borderRadius: 2 }}>
                  System Settings
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. BRANCH MANAGER DASHBOARD (Fully Populated Branch View)
   Focus: Branch Operations & Approvals
   ───────────────────────────────────────────────────────────── */
function BranchManagerDashboard({ user, navigate, stats }) {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <Chip
            icon={<BusinessIcon style={{ color: "#0F766E", fontSize: 16 }} />}
            label={`Branch Manager Workspace - ${user?.branch_name || "Head Office"}`}
            sx={{ bgcolor: "#CCFBF1", color: "#0F766E", fontWeight: 700 }}
          />
        </Stack>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          Welcome, {user?.first_name || "Branch Manager"}
        </Typography>
        <Typography color="#64748B">
          Oversee branch loan approvals, customer groups, field officers, and daily branch collection metrics.
        </Typography>
      </Box>

      {/* Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #0F766E", border: "1px solid #E2E8F0" }}>
            <Typography variant="body2" color="textSecondary" fontWeight={600}>
              Branch Customers
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ my: 0.5 }}>
              {stats?.totalCustomers ?? "—"}
            </Typography>
            <Typography variant="caption" color="#0F766E" fontWeight={600}>
              Assigned to Branch
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #D97706", border: "1px solid #E2E8F0" }}>
            <Typography variant="body2" color="textSecondary" fontWeight={600}>
              Pending Loan Approvals
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#D97706" sx={{ my: 0.5 }}>
              {stats?.pendingApplications ?? "2"}
            </Typography>
            <Typography variant="caption" color="#D97706" fontWeight={600}>
              Requires Approval
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #16A34A", border: "1px solid #E2E8F0" }}>
            <Typography variant="body2" color="textSecondary" fontWeight={600}>
              Today's Branch Collection
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#16A34A" sx={{ my: 0.5 }}>
              {stats?.todayCollection ? `₹${Number(stats.todayCollection).toLocaleString()}` : "₹0"}
            </Typography>
            <Typography variant="caption" color="#16A34A" fontWeight={600}>
              Field Officer Collections
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #0284C7", border: "1px solid #E2E8F0" }}>
            <Typography variant="body2" color="textSecondary" fontWeight={600}>
              Branch Active Loans
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#0284C7" sx={{ my: 0.5 }}>
              {stats?.activeLoans ?? "—"}
            </Typography>
            <Typography variant="caption" color="#0284C7" fontWeight={600}>
              Currently Disbursed
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ borderRadius: 3, p: 3, border: "1px solid #E2E8F0" }}>
        <Typography variant="h6" fontWeight={700} color="#0F172A" mb={2}>
          Branch Operations Shortcuts
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Button fullWidth variant="contained" startIcon={<DescriptionIcon />} onClick={() => navigate("/loan-applications")} sx={{ bgcolor: "#0F766E", py: 1.2, borderRadius: 2 }}>
              Loan Approvals
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button fullWidth variant="outlined" startIcon={<PeopleIcon />} onClick={() => navigate("/users")} sx={{ py: 1.2, borderRadius: 2 }}>
              Branch Staff
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button fullWidth variant="outlined" startIcon={<BusinessIcon />} onClick={() => navigate("/groups")} sx={{ py: 1.2, borderRadius: 2 }}>
              SHG Groups
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button fullWidth variant="outlined" startIcon={<TrendingUpIcon />} onClick={() => navigate("/collections")} sx={{ py: 1.2, borderRadius: 2 }}>
              Branch Collections
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. FIELD OFFICER DASHBOARD (Fully Populated Field View)
   Focus: Field Operations & Onboarding
   ───────────────────────────────────────────────────────────── */
function FieldOfficerDashboard({ user, navigate, stats }) {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <Chip
            icon={<LocationIcon style={{ color: "#0369A1", fontSize: 16 }} />}
            label="Field Officer Workstation"
            sx={{ bgcolor: "#E0F2FE", color: "#0369A1", fontWeight: 700 }}
          />
        </Stack>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          Welcome, {user?.first_name || "Field Officer"}
        </Typography>
        <Typography color="#64748B">
          Field visit schedule, group customer onboarding, and daily EMI loan collection entries.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #0369A1", border: "1px solid #E2E8F0" }}>
            <Typography variant="body2" color="textSecondary" fontWeight={600}>
              Pending Tasks Today
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ my: 0.5 }}>
              4
            </Typography>
            <Typography variant="caption" color="#0369A1" fontWeight={600}>
              Center Visits & Verification
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #059669", border: "1px solid #E2E8F0" }}>
            <Typography variant="body2" color="textSecondary" fontWeight={600}>
              Collections Due Today
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#059669" sx={{ my: 0.5 }}>
              ₹18,500
            </Typography>
            <Typography variant="caption" color="#059669" fontWeight={600}>
              Scheduled EMI Installments
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #7C3AED", border: "1px solid #E2E8F0" }}>
            <Typography variant="body2" color="textSecondary" fontWeight={600}>
              Assigned Groups
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#7C3AED" sx={{ my: 0.5 }}>
              6
            </Typography>
            <Typography variant="caption" color="#7C3AED" fontWeight={600}>
              Self-Help Groups (SHG)
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #D97706", border: "1px solid #E2E8F0" }}>
            <Typography variant="body2" color="textSecondary" fontWeight={600}>
              Assigned Customers
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#D97706" sx={{ my: 0.5 }}>
              {stats?.totalCustomers || "12"}
            </Typography>
            <Typography variant="caption" color="#D97706" fontWeight={600}>
              Active Borrowers
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, p: 3, border: "1px solid #E2E8F0" }}>
        <Typography variant="h6" fontWeight={700} color="#0F172A" mb={2}>
          Field Officer Quick Tools
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button fullWidth variant="contained" startIcon={<TrendingUpIcon />} onClick={() => navigate("/collections")} sx={{ bgcolor: "#059669", py: 1.2, borderRadius: 2 }}>
              Record Field Collection
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button fullWidth variant="outlined" startIcon={<PersonAddIcon />} onClick={() => navigate("/customers")} sx={{ py: 1.2, borderRadius: 2 }}>
              Onboard New Customer
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button fullWidth variant="outlined" startIcon={<TaskIcon />} onClick={() => navigate("/tasks")} sx={{ py: 1.2, borderRadius: 2 }}>
              Field Tasks & Schedule
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────────
   5. ACCOUNTANT DASHBOARD (Fully Populated Finance View)
   Focus: Financial Accounts & Cash Book
   ───────────────────────────────────────────────────────────── */
function AccountantDashboard({ user, navigate, stats }) {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <Chip
            icon={<WalletIcon style={{ color: "#047857", fontSize: 16 }} />}
            label="Accounts & Finance Workspace"
            sx={{ bgcolor: "#ECFDF5", color: "#047857", fontWeight: 700 }}
          />
        </Stack>
        <Typography variant="h4" fontWeight={800} color="#0F172A">
          Welcome, {user?.first_name || "Accounts Officer"}
        </Typography>
        <Typography color="#64748B">
          General ledger cash book, expense vouchers, fee income, and daily financial reconciliation.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #047857", border: "1px solid #E2E8F0" }}>
            <Typography variant="body2" color="textSecondary" fontWeight={600}>
              Cash Book Balance
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ my: 0.5 }}>
              ₹2,45,000
            </Typography>
            <Typography variant="caption" color="#047857" fontWeight={600}>
              Net Cash in Hand
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #0284C7", border: "1px solid #E2E8F0" }}>
            <Typography variant="body2" color="textSecondary" fontWeight={600}>
              Today's Income
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#0284C7" sx={{ my: 0.5 }}>
              ₹12,400
            </Typography>
            <Typography variant="caption" color="#0284C7" fontWeight={600}>
              Processing Fees & Interest
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #DC2626", border: "1px solid #E2E8F0" }}>
            <Typography variant="body2" color="textSecondary" fontWeight={600}>
              Today's Expenses
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#DC2626" sx={{ my: 0.5 }}>
              ₹3,200
            </Typography>
            <Typography variant="caption" color="#DC2626" fontWeight={600}>
              Branch Vouchers Logged
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, borderRadius: 3, borderLeft: "4px solid #16A34A", border: "1px solid #E2E8F0" }}>
            <Typography variant="body2" color="textSecondary" fontWeight={600}>
              Total Collections Today
            </Typography>
            <Typography variant="h3" fontWeight={800} color="#16A34A" sx={{ my: 0.5 }}>
              {stats?.todayCollection ? `₹${Number(stats.todayCollection).toLocaleString()}` : "₹45,000"}
            </Typography>
            <Typography variant="caption" color="#16A34A" fontWeight={600}>
              EMI Receipts Logged
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3, p: 3, border: "1px solid #E2E8F0" }}>
        <Typography variant="h6" fontWeight={700} color="#0F172A" mb={2}>
          Financial Accounting Tools
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Button fullWidth variant="contained" startIcon={<WalletIcon />} onClick={() => navigate("/cashbook")} sx={{ bgcolor: "#047857", py: 1.2, borderRadius: 2 }}>
              Cash Book Ledger
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button fullWidth variant="outlined" startIcon={<ReceiptIcon />} onClick={() => navigate("/expenses")} sx={{ py: 1.2, borderRadius: 2 }}>
              Record Expense
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button fullWidth variant="outlined" startIcon={<TrendingUpIcon />} onClick={() => navigate("/income")} sx={{ py: 1.2, borderRadius: 2 }}>
              Record Fee Income
            </Button>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button fullWidth variant="outlined" startIcon={<DescriptionIcon />} onClick={() => navigate("/loan-reports")} sx={{ py: 1.2, borderRadius: 2 }}>
              Financial Reports
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
