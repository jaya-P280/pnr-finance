import { Alert, Box, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AccountBalanceWallet, Assignment, Description, VerifiedUser } from "@mui/icons-material";
import useAuth from "../../hooks/useAuth";

const actions = [
  { title: "Complete e-KYC", description: "Verify your identity before applying for a loan.", icon: VerifiedUser, path: "/customer/ekyc", color: "#0F766E" },
  { title: "Apply for a Loan", description: "Choose a loan product and submit a new application.", icon: Description, path: "/customer/apply-loan", color: "#2563EB" },
  { title: "My Applications", description: "Track the status of your submitted applications.", icon: Assignment, path: "/customer/applications", color: "#7C3AED" },
  { title: "My Active Loans", description: "View loan details and repayment schedules.", icon: AccountBalanceWallet, path: "/customer/loans", color: "#D97706" },
];

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const name = user?.firstName || user?.first_name || "Customer";

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="#0F172A" gutterBottom>Welcome back, {name}</Typography>
        <Typography color="#64748B">Manage your loan applications, active loans, and identity verification in one place.</Typography>
      </Box>

      <Alert severity="info" action={<Button color="inherit" size="small" onClick={() => navigate("/customer/ekyc")}>Complete e-KYC</Button>} sx={{ mb: 3, borderRadius: 2 }}>
        Complete your e-KYC to make sure your loan application can be processed without delay.
      </Alert>

      <Typography variant="h6" fontWeight={700} color="#0F172A" mb={2}>Quick actions</Typography>
      <Grid container spacing={2.5}>
        {actions.map(({ title, description, icon: Icon, path, color }) => (
          <Grid size={{ xs: 12, sm: 6 }} key={title}>
            <Card elevation={0} sx={{ height: "100%", border: "1px solid #E2E8F0", borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: `${color}18`, color }}><Icon /></Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight={700} color="#0F172A">{title}</Typography>
                    <Typography variant="body2" color="#64748B" sx={{ mt: 0.5, mb: 2 }}>{description}</Typography>
                    <Button size="small" onClick={() => navigate(path)} sx={{ px: 0, color }}>Open</Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
