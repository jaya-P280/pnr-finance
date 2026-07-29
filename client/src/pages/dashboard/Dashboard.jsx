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
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  WarningAmber as WarningIcon,
  CheckCircle as CheckIcon,
  AccountBalanceWallet as LoanIcon,
  CalendarMonth as EmiIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import DashboardCard from "./DashboardCard";
import dashboardService from "../../services/dashboard.service";
import useAuth from "../../hooks/useAuth";

const quickActions = [
  { title: "Add Customer", path: "/customers" },
  { title: "Loan Applications", path: "/loan-applications" },
  { title: "Collections", path: "/collections" },
  { title: "Reports", path: "/loan-reports" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const roleName = user?.role_name || user?.role || "";

  // Fetch org stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 30000,
  });

  // Fetch personal user data (loans, eKYC status)
  const { data: myData } = useQuery({
    queryKey: ["myDashboard"],
    queryFn: () => dashboardService.getMyData(),
    enabled: !!user?.user_id,
  });

  const cards = useMemo(
    () => [
      {
        title: "Total Customers",
        value: stats?.totalCustomers ?? "—",
        color: "#0F766E",
      },
      {
        title: "Active Loans",
        value: stats?.activeLoans ?? "—",
        color: "#16A34A",
      },
      {
        title: "Today's Collection",
        value: stats?.todayCollection
          ? `₹${Number(stats.todayCollection).toLocaleString()}`
          : "—",
        color: "#F59E0B",
      },
      {
        title: "Overdue Loans",
        value: stats?.overdueLoans ?? "—",
        color: "#DC2626",
      },
    ],
    [stats],
  );

  const isAdmin = ["SUPER_ADMIN", "ADMIN"].includes(roleName);

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="#0F172A" gutterBottom>
          Welcome, {user?.first_name || "User"}
        </Typography>
        <Typography color="#64748B">
          {isAdmin
            ? "Real-time business insights and quick access to frequently used screens."
            : "Your personal loan overview, eKYC status, and quick actions."}
        </Typography>
      </Box>

      {/* ─── PERSONAL SECTION (for non-admin users) ─── */}
      {!isAdmin && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* eKYC Status Alert */}
          {myData?.ekycStatus !== "COMPLETED" && (
            <Grid item xs={12}>
              <Alert
                severity="warning"
                icon={<WarningIcon />}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => navigate("/customer-documents")}
                  >
                    Complete eKYC
                  </Button>
                }
                sx={{ borderRadius: 2 }}
              >
                Your eKYC is {myData?.ekycStatus || "not completed"}. Please
                complete your KYC verification to proceed with loan
                applications.
              </Alert>
            </Grid>
          )}

          {/* My Loans Summary */}
          {myData?.loans?.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{ border: "1px solid #E2E8F0", borderRadius: 3 }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" gap={1} mb={2}>
                    <LoanIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                      My Loans
                    </Typography>
                  </Stack>
                  {myData.loans.map((loan) => (
                    <Box
                      key={loan.loan_id}
                      sx={{
                        p: 1.5,
                        mb: 1,
                        bgcolor: "#F8FAFC",
                        borderRadius: 2,
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {loan.loan_number}
                          </Typography>
                          <Typography variant="caption" color="#64748B">
                            Principal: ₹
                            {Number(loan.principal_amount).toLocaleString()}
                          </Typography>
                        </Box>
                        <Chip
                          label={loan.status}
                          size="small"
                          color={
                            loan.status === "ACTIVE" ? "success" : "default"
                          }
                        />
                      </Stack>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="#0F766E"
                        mt={0.5}
                      >
                        Outstanding: ₹
                        {Number(loan.outstanding_amount).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* EMI Schedule */}
          {myData?.emiSchedule?.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card
                elevation={0}
                sx={{ border: "1px solid #E2E8F0", borderRadius: 3 }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" gap={1} mb={2}>
                    <EmiIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                      Upcoming EMIs
                    </Typography>
                  </Stack>
                  {myData.emiSchedule.slice(0, 5).map((emi) => (
                    <Box
                      key={emi.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        py: 1,
                        borderBottom: "1px solid #F1F5F9",
                      }}
                    >
                      <Typography variant="body2" color="#64748B">
                        {emi.due_date}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        ₹{Number(emi.amount).toLocaleString()}
                      </Typography>
                      <Chip
                        label={emi.status}
                        size="small"
                        color={emi.status === "PAID" ? "success" : "warning"}
                      />
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Settings Shortcut */}
          <Grid item xs={12}>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => navigate("/settings")}
              sx={{ borderColor: "#E2E8F0", color: "#0F172A", borderRadius: 2 }}
            >
              My Settings
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
          </Grid>
        </Grid>
      )}

      {/* ─── ORG STATS (visible to all) ─── */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} alignItems="stretch">
          {cards.map((card) => (
            <Grid item xs={12} sm={6} lg={3} key={card.title}>
              <DashboardCard
                title={card.title}
                value={card.value}
                color={card.color}
                icon={null}
              />
            </Grid>
          ))}

          <Grid item xs={12} md={8}>
            <Card sx={{ minHeight: 340 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  color="#0F172A"
                  mb={2}
                  fontWeight={700}
                >
                  Monthly Collection Trend
                </Typography>
                {stats?.monthlyChart?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={stats.monthlyChart}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) =>
                          `₹${Number(value).toLocaleString()}`
                        }
                      />
                      <Bar
                        dataKey="total"
                        fill="#0F766E"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box
                    sx={{
                      height: 260,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748B",
                    }}
                  >
                    No collection data yet.
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ minHeight: 340 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  color="#0F172A"
                  mb={2}
                  fontWeight={700}
                >
                  Branch Performance
                </Typography>
                {stats?.branchPerformance?.length > 0 ? (
                  <Stack spacing={1.5}>
                    {stats.branchPerformance.slice(0, 5).map((branch) => (
                      <Box
                        key={branch.branch_id}
                        sx={{
                          p: 1.5,
                          bgcolor: "#F8FAFC",
                          borderRadius: 2,
                          border: "1px solid #E2E8F0",
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="#0F172A"
                        >
                          {branch.branch_name}
                        </Typography>
                        <Typography variant="caption" color="#64748B">
                          {branch.active_loans} loans · ₹
                          {Number(branch.portfolio_size).toLocaleString()}{" "}
                          portfolio
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography color="#64748B">No branch data yet.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions (admin only) */}
          {isAdmin && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography
                    variant="h6"
                    color="#0F172A"
                    mb={2}
                    fontWeight={700}
                  >
                    Quick Actions
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    {quickActions.map((action) => (
                      <Button
                        key={action.title}
                        variant="contained"
                        onClick={() => navigate(action.path)}
                        sx={{
                          bgcolor: "#0F766E",
                          "&:hover": { bgcolor: "#0D9488" },
                        }}
                      >
                        {action.title}
                      </Button>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </>
  );
}
