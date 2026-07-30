import {
  AppBar, Toolbar, Box, Typography, IconButton, Avatar, Tooltip, Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";

export default function Header({ open, onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  const initials =
    user?.first_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() || "A";

  const fullName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`
    : "Administrator";

  const profileImageUrl = user?.profile_image || user?.profileImage || "";
  const isCustomer = (user?.role_name || user?.role) === "CUSTOMER";
  const profilePath = isCustomer ? "/customer/profile" : "/profile";
  const utilityPath = isCustomer ? "/customer/ekyc" : "/settings";
  const utilityLabel = isCustomer ? "e-KYC Status" : "Settings";

  return (
    <AppBar position="fixed" elevation={0} sx={{
      height: 80, bgcolor: "#FFFFFF", borderRadius: 0,
      borderBottom: "1px solid #E2E8F0",
      zIndex: (theme) => theme.zIndex.drawer - 1,
    }}>
      <Toolbar sx={{
        height: "80px", minHeight: "80px !important",
        display: "flex", justifyContent: "space-between", px: 3,
      }}>
        {/* Left: Hamburger + Logo */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={onToggleSidebar} sx={{ color: "#0F766E" }}>
            <MenuIcon />
          </IconButton>
          {!open && (
            <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
              {/* <Box component="img" src={logo} sx={{ width: 42, height: 42, objectFit: "contain", mr: 2 }} /> */}
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#000000" }}>PNRG Finance</Typography>
                <Typography variant="caption" sx={{ color: "#000000" }}>Microfinance Management</Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Right: Inline User Menu — NO DROPDOWN */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="View Profile">
            <Button
              onClick={() => navigate(profilePath)}
              sx={{
                textTransform: "none", display: "flex", alignItems: "center", gap: 1,
                px: 1.5, py: 0.5, borderRadius: 2, color: "#0F172A",
                "&:hover": { bgcolor: "#F1F5F9" },
              }}
            >
              <Avatar src={profileImageUrl} alt={initials}
                sx={{ bgcolor: "#0F766E", width: 34, height: 34, fontSize: 14, fontWeight: 700 }}>
                {initials}
              </Avatar>
              <Box sx={{ textAlign: "left", lineHeight: 1.2 }}>
                <Typography fontSize={13} fontWeight={600}>{fullName}</Typography>
                <Typography fontSize={11} color="#64748B">{user?.role_name || user?.role || "User"}</Typography>
              </Box>
            </Button>
          </Tooltip>

          <Box sx={{ width: 1, height: 24, bgcolor: "#E2E8F0", mx: 0.5 }} />

          <Tooltip title={utilityLabel}>
            <IconButton onClick={() => navigate(utilityPath)}
              sx={{ color: "#64748B", "&:hover": { color: "#0F766E", bgcolor: "#F1F5F9" } }}>
              {isCustomer ? <VerifiedUserIcon /> : <SettingsIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout">
            <IconButton onClick={handleLogout}
              sx={{ color: "#64748B", "&:hover": { color: "#DC2626", bgcolor: "#FEF2F2" } }}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
