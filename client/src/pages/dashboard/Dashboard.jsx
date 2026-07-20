import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import DashboardCard from "./DashboardCard";

const quickActions = [
  { title: "Add Customer", path: "/customers" },
  { title: "Loan Applications", path: "/loan-applications" },
  { title: "Collections", path: "/collections" },
  { title: "Reports", path: "/loan-reports" },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const cards = useMemo(
    () => [
      {
        title: "Customers",
        value: "1,245",
        color: "#0F766E",
      },
      {
        title: "Active Loans",
        value: "874",
        color: "#16A34A",
      },
      {
        title: "Today's Collection",
        value: "₹2,45,000",
        color: "#F59E0B",
      },
      {
        title: "Pending Loans",
        value: "56",
        color: "#DC2626",
      },
    ],
    []
  );

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="#0F172A" gutterBottom>
          Dashboard
        </Typography>
        <Typography color="#64748B">
          Real-time business insights and quick access to frequently used workflow screens.
        </Typography>
      </Box>

      <Grid container spacing={3} alignItems="stretch">
        {cards.map((card) => (
          <Grid item xs={12} sm={6} lg={3} key={card.title}>
            <DashboardCard title={card.title} value={card.value} color={card.color} icon={null} />
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Card sx={{ minHeight: 340 }}>
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" color="#0F172A" mb={1} fontWeight={700}>
                    Business Snapshot
                  </Typography>
                  <Typography color="#64748B">
                    Key performance indicators, collection maturity and branch performance charts will appear here once backend analytics are connected.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    height: 260,
                    background: "linear-gradient(135deg, #F8FAFC 0%, #E0F2FE 100%)",
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748B",
                    fontWeight: 600,
                  }}
                >
                  Analytics Widget Placeholder
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ minHeight: 340 }}>
            <CardContent>
              <Typography variant="h6" color="#0F172A" mb={2} fontWeight={700}>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(action.path)}
                    sx={{
                      bgcolor: "#0F766E",
                      "&:hover": {
                        bgcolor: "#0D9488",
                      },
                    }}
                  >
                    {action.title}
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
