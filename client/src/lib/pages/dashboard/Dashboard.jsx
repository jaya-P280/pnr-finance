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
import DashboardCard from "./DashboardCard";
import dashboardService from "../../services/dashboard.service";
import useAuth from "../../hooks/useAuth";
import CustomerDashboard from "../customer-portal/CustomerDashboard";

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
  const isCustomer = roleName === "CUSTOMER";

  // Fetch org stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 30000,
    enabled: !isCustomer,
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

  if (isCustomer) {
    return <CustomerDashboard />;
  }

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

      {/* ─── PERSONAL SECTION (for non-admin employees) ─── */}
      {!isAdmin && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={12}>
            <Typography color="#64748B">Use the sidebar to access your assigned work.</Typography>
          </Grid>
        </Grid>
      )}

      {/* ─── ORG STATS (visible to all) ─── */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
          {cards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.title}>
              <DashboardCard
                title={card.title}
                value={card.value}
                color={card.color}
                icon={null}
              />
            </Grid>
          ))}

          <Grid size={{ xs: 12, md: 8 }}>
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

          <Grid size={{ xs: 12, md: 4 }}>
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
            <Grid size={12}>
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
                  <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap" }}>
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
