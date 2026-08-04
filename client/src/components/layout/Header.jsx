import {
  AppBar, Toolbar, Box, Typography, IconButton, Avatar, Tooltip, Button, Chip, Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { DRAWER_WIDTH } from "../constants/layout.constants";

export default function Header({ open, mobile, onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  const initials =
    user?.firstName?.[0]?.toUpperCase() || user?.first_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() || "A";

  const firstName = user?.firstName || user?.first_name;
  const lastName = user?.lastName || user?.last_name;
  const fullName = firstName
    ? `${firstName} ${lastName || ""}`.trim()
    : "Administrator";

  const profileImageUrl = user?.profile_image || user?.profileImage || "";
  const roleName = (user?.role_name || user?.role || "").toUpperCase().replace(/\s+/g, "_");
  const isCustomer = roleName === "CUSTOMER";
  const isSuperAdmin = roleName === "SUPER_ADMIN";
  const isFinanceRole = ["ADMIN", "BRANCH_MANAGER", "ACCOUNTANT"].includes(roleName);

  const formatRoleLabel = (str) => {
    if (!str) return "User";
    return str
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const profilePath = isCustomer ? "/customer/profile" : "/profile";
  const utilityPath = isCustomer ? "/customer/ekyc" : "/settings";
  const utilityLabel = isCustomer ? "e-KYC Status" : "Settings";

  const isShifted = open && !mobile;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        height: 80,
        bgcolor: "#FFFFFF",
        borderRadius: 0,
        borderBottom: "1px solid #E2E8F0",
        zIndex: (theme) => theme.zIndex.drawer - 1,
        width: isShifted ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
        ml: isShifted ? `${DRAWER_WIDTH}px` : 0,
        transition: (theme) =>
          theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.easeInOut,
            duration: 300,
          }),
      }}
    >
      <Toolbar
        sx={{
          height: "80px",
          minHeight: "80px !important",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: { xs: 2, sm: 3 },
        }}
      >
        {/* Left: Hamburger + Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={onToggleSidebar} sx={{ color: "#0F766E" }}>
            <MenuIcon />
          </IconButton>
          {(!open || mobile) && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ color: "#0F766E", letterSpacing: "-0.5px" }}>
                  PNRG Finance
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500, display: "block", mt: "-2px" }}>
                  Microfinance ERP
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Center: Quick Shortcuts based on Role */}
        {isFinanceRole && (
          <Stack direction="row" spacing={1} sx={{ display: { xs: "none", xl: "flex" }, alignItems: "center" }}>
            <Button
              size="small"
              startIcon={<AccountBalanceWalletIcon sx={{ fontSize: 18 }} />}
              onClick={() => navigate("/cashbook")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#0F766E",
                bgcolor: "#F0FDF4",
                borderRadius: 2,
                px: 1.5,
                "&:hover": { bgcolor: "#DCFCE7" },
              }}
            >
              Cash Book
            </Button>
            <Button
              size="small"
              startIcon={<ReceiptLongIcon sx={{ fontSize: 18 }} />}
              onClick={() => navigate("/expenses")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#991B1B",
                bgcolor: "#FEF2F2",
                borderRadius: 2,
                px: 1.5,
                "&:hover": { bgcolor: "#FEE2E2" },
              }}
            >
              Expenses
            </Button>
            <Button
              size="small"
              startIcon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
              onClick={() => navigate("/income")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#065F46",
                bgcolor: "#ECFDF5",
                borderRadius: 2,
                px: 1.5,
                "&:hover": { bgcolor: "#A7F3D0" },
              }}
            >
              Income
            </Button>
          </Stack>
        )}

        {/* Right: Inline User Controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexShrink: 0 }}>
          <Chip
            label={formatRoleLabel(roleName || "USER")}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: "0.72rem",
              bgcolor: isCustomer ? "#CCFBF1" : isSuperAdmin ? "#FEF3C7" : "#E0F2FE",
              color: isCustomer ? "#0F766E" : isSuperAdmin ? "#B45309" : "#0369A1",
              display: { xs: "none", sm: "inline-flex" },
              flexShrink: 0,
            }}
          />

          <Tooltip title="View Profile">
            <Button
              onClick={() => navigate(profilePath)}
              sx={{
                textTransform: "none",
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1.25,
                py: 0.5,
                height: "auto",
                minHeight: 0,
                borderRadius: 2,
                color: "#0F172A",
                minWidth: 0,
                flexShrink: 1,
                overflow: "hidden",
                "&:hover": { bgcolor: "#F1F5F9" },
              }}
            >
              <Avatar
                src={profileImageUrl}
                alt={initials}
                sx={{
                  bgcolor: "#0F766E",
                  width: 36,
                  height: 36,
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {initials}
              </Avatar>
              <Box
                sx={{
                  textAlign: "left",
                  lineHeight: 1.25,
                  display: { xs: "none", md: "block" },
                  maxWidth: 180,
                  overflow: "hidden",
                }}
              >
                <Typography fontSize={13} fontWeight={700} color="#0F172A" noWrap>
                  {fullName}
                </Typography>
                <Typography fontSize={11} color="#64748B" noWrap>
                  {user?.email || "User"}
                </Typography>
              </Box>
            </Button>
          </Tooltip>

          <Box sx={{ width: "1px", height: 24, bgcolor: "#E2E8F0", mx: 0.5, flexShrink: 0 }} />

          <Tooltip title={utilityLabel}>
            <IconButton
              onClick={() => navigate(utilityPath)}
              sx={{ color: "#64748B", flexShrink: 0, "&:hover": { color: "#0F766E", bgcolor: "#F1F5F9" } }}
            >
              {isCustomer ? <VerifiedUserIcon /> : <SettingsIcon />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogout}
              sx={{ color: "#64748B", flexShrink: 0, "&:hover": { color: "#DC2626", bgcolor: "#FEF2F2" } }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
