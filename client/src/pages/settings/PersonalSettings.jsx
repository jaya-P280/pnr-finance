import { Avatar, Box, Button, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import SectionPage from "../../components/layout/SectionPage";

export default function PersonalSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.firstName || user?.first_name || "User";
  const lastName = user?.lastName || user?.last_name || "";
  const name = `${firstName} ${lastName}`.trim();

  return (
    <SectionPage title="Settings" subtitle="Manage your personal account preferences.">
      <Card elevation={0} sx={{ maxWidth: 720, border: "1px solid #E2E8F0", borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <Avatar src={user?.profile_image || user?.profileImage} sx={{ width: 64, height: 64, bgcolor: "#0F766E" }}>{firstName[0]?.toUpperCase()}</Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>{name}</Typography>
              <Typography color="text.secondary">{user?.email || "No email address"}</Typography>
              <Typography variant="body2" color="text.secondary">{user?.role_name || user?.role || "User"}</Typography>
            </Box>
            <Button variant="contained" onClick={() => navigate((user?.role_name || user?.role) === "CUSTOMER" ? "/customer/profile" : "/profile")} sx={{ bgcolor: "#0F766E" }}>Edit profile</Button>
          </Stack>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle1" fontWeight={700}>Account</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Update your personal details and profile photo from your profile page.</Typography>
        </CardContent>
      </Card>
    </SectionPage>
  );
}
