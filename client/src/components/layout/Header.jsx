import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Button,
  Chip,
  Stack,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ShieldIcon from "@mui/icons-material/Shield";
import BusinessIcon from "@mui/icons-material/Business";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import HistoryIcon from "@mui/icons-material/History";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AssessmentIcon from "@mui/icons-material/Assessment";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { DRAWER_WIDTH } from "../constants/layout.constants";

export default function Header({ open, mobile, onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifAnchor, setNotifAnchor] = useState(null);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  const initials =
    user?.firstName?.[0]?.toUpperCase() ||
    user?.first_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "A";

  const firstName = user?.firstName || user?.first_name;
  const lastName = user?.lastName || user?.last_name;
  const fullName = firstName
    ? `${firstName} ${lastName || ""}`.trim()
    : "Staff Member";

  const profileImageUrl = user?.profile_image || user?.profileImage || "";
  const roleName = (user?.role_name || user?.role || "").toUpperCase().replace(/\s+/g, "_");
  const isCustomer = roleName === "CUSTOMER";
  const branchName = user?.branch_name || user?.branch || "Head Office";

  // Role Configuration
  const getRoleConfig = () => {
    switch (roleName) {
      case "SUPER_ADMIN":
      case "ADMIN":
        return {
          label: roleName === "SUPER_ADMIN" ? "Super Admin" : "System Admin",
          icon: <ShieldIcon sx={{ fontSize: 16 }} />,
          bg: "#FEF3C7",
          color: "#B45309",
          border: "#FDE68A",
          branchText: "HQ Central Admin",
          shortcuts: [
            { label: "Cash Book", path: "/cashbook", icon: <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />, color: "#0F766E", bg: "#F0FDF4" },
            { label: "Loan Apps", path: "/loan-applications", icon: <RequestQuoteIcon sx={{ fontSize: 16 }} />, color: "#0284C7", bg: "#E0F2FE" },
            { label: "Audit Trail", path: "/audit-logs", icon: <HistoryIcon sx={{ fontSize: 16 }} />, color: "#7C3AED", bg: "#F3E8FF" },
            { label: "System Config", path: "/settings", icon: <SettingsIcon sx={{ fontSize: 16 }} />, color: "#334155", bg: "#F1F5F9" },
          ],
        };

      case "BRANCH_MANAGER":
        return {
          label: "Branch Manager",
          icon: <BusinessIcon sx={{ fontSize: 16 }} />,
          bg: "#CCFBF1",
          color: "#0F766E",
          border: "#99F6E4",
          branchText: `Branch: ${branchName}`,
          shortcuts: [
            { label: "Pending Loans", path: "/loan-applications", icon: <RequestQuoteIcon sx={{ fontSize: 16 }} />, color: "#D97706", bg: "#FEF3C7" },
            { label: "SHG Groups", path: "/groups", icon: <GroupWorkIcon sx={{ fontSize: 16 }} />, color: "#0F766E", bg: "#F0FDF4" },
            { label: "Collections", path: "/collections", icon: <TrendingUpIcon sx={{ fontSize: 16 }} />, color: "#0284C7", bg: "#E0F2FE" },
            { label: "Branch Report", path: "/branch-performance-report", icon: <AssessmentIcon sx={{ fontSize: 16 }} />, color: "#4338CA", bg: "#EEF2FF" },
          ],
        };

      case "FIELD_OFFICER":
        return {
          label: "Field Officer",
          icon: <LocationOnIcon sx={{ fontSize: 16 }} />,
          bg: "#E0F2FE",
          color: "#0369A1",
          border: "#BAE6FD",
          branchText: `Branch: ${branchName}`,
          shortcuts: [
            { label: "Log Collection", path: "/collections", icon: <TrendingUpIcon sx={{ fontSize: 16 }} />, color: "#059669", bg: "#ECFDF5" },
            { label: "My Groups", path: "/groups", icon: <GroupWorkIcon sx={{ fontSize: 16 }} />, color: "#0F766E", bg: "#F0FDF4" },
            { label: "Field Tasks", path: "/tasks", icon: <AssignmentTurnedInIcon sx={{ fontSize: 16 }} />, color: "#4F46E5", bg: "#EEF2FF" },
          ],
        };

      case "ACCOUNTANT":
        return {
          label: "Accounts Officer",
          icon: <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />,
          bg: "#ECFDF5",
          color: "#047857",
          border: "#A7F3D0",
          branchText: `Branch: ${branchName}`,
          shortcuts: [
            { label: "Cash Book", path: "/cashbook", icon: <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />, color: "#047857", bg: "#ECFDF5" },
            { label: "Vouchers/Expenses", path: "/expenses", icon: <ReceiptLongIcon sx={{ fontSize: 16 }} />, color: "#DC2626", bg: "#FEF2F2" },
            { label: "Fee Income", path: "/income", icon: <TrendingUpIcon sx={{ fontSize: 16 }} />, color: "#0284C7", bg: "#E0F2FE" },
            { label: "Cash Flow", path: "/cash-flow-report", icon: <AssessmentIcon sx={{ fontSize: 16 }} />, color: "#6B21A8", bg: "#F3E8FF" },
          ],
        };

      default:
        return {
          label: roleName.replace(/_/g, " "),
          icon: null,
          bg: "#F1F5F9",
          color: "#334155",
          border: "#CBD5E1",
          branchText: branchName,
          shortcuts: [],
        };
    }
  };

  const roleConfig = getRoleConfig();
  const profilePath = isCustomer ? "/customer/profile" : "/profile";
  const isShifted = open && !mobile;

  // Mock Notification items for non-customer staff
  const notifications = [
    { id: 1, title: "Loan Application Pending", time: "10 mins ago", unread: true },
    { id: 2, title: "Daily Cash Book Reconciled", time: "1 hour ago", unread: false },
    { id: 3, title: "Center Collection Due Today", time: "2 hours ago", unread: true },
  ];

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <IconButton onClick={onToggleSidebar} sx={{ color: "#0F766E", bgcolor: "#F0FDF4", "&:hover": { bgcolor: "#CCFBF1" } }}>
            <MenuIcon />
          </IconButton>
          {(!open || mobile) && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ color: "#0F766E", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
                  PNRG Finance
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600, display: "block" }}>
                  Microfinance ERP
                </Typography>
              </Box>
            </Box>
          )}

          {/* Branch Badge for Staff */}
          {!isCustomer && (
            <Chip
              icon={<LocationOnIcon sx={{ fontSize: "14px !important", color: "#0F766E" }} />}
              label={roleConfig.branchText}
              size="small"
              sx={{
                display: { xs: "none", md: "inline-flex" },
                bgcolor: "#F8FAFC",
                color: "#334155",
                fontWeight: 600,
                fontSize: "0.75rem",
                border: "1px solid #E2E8F0",
                ml: 1,
              }}
            />
          )}
        </Box>

        {/* Center: Dynamic Role-Based Shortcuts */}
        {!isCustomer && roleConfig.shortcuts.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center" }}>
            {roleConfig.shortcuts.map((sc) => (
              <Button
                key={sc.label}
                size="small"
                startIcon={sc.icon}
                onClick={() => navigate(sc.path)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  color: sc.color,
                  bgcolor: sc.bg,
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.6,
                  border: `1px solid ${sc.bg}`,
                  "&:hover": {
                    filter: "brightness(0.95)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                  },
                }}
              >
                {sc.label}
              </Button>
            ))}
          </Stack>
        )}

        {/* Right: User Profile, Role Badge, Notifications & Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexShrink: 0 }}>
          {/* Custom Role Chip */}
          <Chip
            icon={roleConfig.icon}
            label={roleConfig.label}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: "0.75rem",
              bgcolor: roleConfig.bg,
              color: roleConfig.color,
              border: `1px solid ${roleConfig.border}`,
              display: { xs: "none", sm: "inline-flex" },
              px: 0.5,
            }}
          />

          {/* Notifications Button */}
          {!isCustomer && (
            <>
              <Tooltip title="Notifications & Alerts">
                <IconButton
                  onClick={(e) => setNotifAnchor(e.currentTarget)}
                  sx={{ color: "#64748B", bgcolor: "#F8FAFC", "&:hover": { color: "#0F766E", bgcolor: "#F1F5F9" } }}
                >
                  <Badge badgeContent={2} color="error" variant="dot">
                    <NotificationsIcon fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Popover
                open={Boolean(notifAnchor)}
                anchorEl={notifAnchor}
                onClose={() => setNotifAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                  sx: { width: 320, p: 0, borderRadius: 3, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" },
                }}
              >
                <Box sx={{ p: 2, bgcolor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                    Notifications & Alerts
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Role-based operational updates
                  </Typography>
                </Box>
                <List disablePadding>
                  {notifications.map((item, idx) => (
                    <Box key={item.id}>
                      <ListItem sx={{ py: 1.5, bgcolor: item.unread ? "#F0FDF4" : "#FFFFFF" }}>
                        <ListItemText
                          primary={item.title}
                          primaryTypographyProps={{ fontSize: "0.85rem", fontWeight: item.unread ? 700 : 500 }}
                          secondary={item.time}
                          secondaryTypographyProps={{ fontSize: "0.75rem" }}
                        />
                      </ListItem>
                      {idx < notifications.length - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              </Popover>
            </>
          )}

          {/* Profile Button */}
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
                borderRadius: 2,
                color: "#0F172A",
                "&:hover": { bgcolor: "#F1F5F9" },
              }}
            >
              <Avatar
                src={profileImageUrl}
                alt={initials}
                sx={{
                  bgcolor: roleConfig.color,
                  width: 38,
                  height: 38,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                {initials}
              </Avatar>
              <Box
                sx={{
                  textAlign: "left",
                  lineHeight: 1.2,
                  display: { xs: "none", md: "block" },
                  maxWidth: 160,
                  overflow: "hidden",
                }}
              >
                <Typography fontSize={13} fontWeight={700} color="#0F172A" noWrap>
                  {fullName}
                </Typography>
                <Typography fontSize={11} color="#64748B" noWrap>
                  {user?.email || "Staff Member"}
                </Typography>
              </Box>
            </Button>
          </Tooltip>

          <Box sx={{ width: "1px", height: 24, bgcolor: "#E2E8F0", mx: 0.5 }} />

          {/* Settings Icon */}
          <Tooltip title={isCustomer ? "e-KYC Status" : "System Settings"}>
            <IconButton
              onClick={() => navigate(isCustomer ? "/customer/ekyc" : "/settings")}
              sx={{ color: "#64748B", "&:hover": { color: "#0F766E", bgcolor: "#F1F5F9" } }}
            >
              {isCustomer ? <VerifiedUserIcon /> : <SettingsIcon />}
            </IconButton>
          </Tooltip>

          {/* Logout */}
          <Tooltip title="Logout">
            <IconButton
              onClick={handleLogout}
              sx={{ color: "#64748B", "&:hover": { color: "#DC2626", bgcolor: "#FEF2F2" } }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
