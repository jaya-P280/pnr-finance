import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@mui/material";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

import useAuth from "../../hooks/useAuth";
import logo from "../../assets/logo.webp";
import toast from "react-hot-toast";

export default function Header({ open, onToggleSidebar }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuOpen = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    toast.success("Logged out successfully.");
    navigate("/login", { replace: true });
  };

  const handleProfile = () => {
    handleClose();
    navigate("/profile");
  };

  const handleSettings = () => {
    handleClose();
    navigate("/settings");
  };

  const initials =
    user?.first_name?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "A";

  const profileImageUrl = user?.profile_image || user?.profileImage || "";

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          height: 80,
          bgcolor: "#FFFFFF",
          borderRadius: 0,
          borderBottom: "1px solid #E2E8F0",
          zIndex: (theme) => theme.zIndex.drawer - 1,
          transition: (theme) =>
            theme.transitions.create(["padding", "width"], {
              easing: theme.transitions.easing.easeInOut,
              duration: 350,
            }),
        }}
      >
        <Toolbar
          sx={{
            height: "80px",
            minHeight: "80px !important",
            display: "flex",
            justifyContent: "space-between",
            px: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton onClick={onToggleSidebar} sx={{ color: "#0F766E" }}>
              <MenuIcon />
            </IconButton>

            {!open && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  ml: 2,
                  transition: "all .3s",
                }}
              >
                <Box
                  component="img"
                  src={logo}
                  sx={{
                    width: 42,
                    height: 42,
                    objectFit: "contain",
                    mr: 2,
                  }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: "#000000" }}
                  >
                    PNRG Finance
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#000000" }}>
                    Microfinance Management
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={handleOpen}>
              <Avatar
                src={profileImageUrl}
                alt={initials}
                sx={{
                  bgcolor: "#0F766E",
                  width: 40,
                  height: 40,
                  border: "2px solid #ffffffa8",
                  boxShadow: "0 0 0 2px #FFFFF",
                }}
              >
                {initials}
              </Avatar>
            </IconButton>
            {/* <IconButton onClick={handleOpen} sx={{ color: "#64748B" }}>
              <KeyboardArrowDownIcon />
            </IconButton> */}
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleClose}
        PaperProps={{
          sx: {
            boxShadow: "0 10px 40px rgba(15, 118, 110, 0.12)",
            borderRadius: 2,
          },
        }}
      >
        <MenuItem disabled>
          <Typography fontWeight={600} color="#0F172A">
            {user?.first_name
              ? `${user.first_name} ${user.last_name || ""}`
              : "Administrator"}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <PersonIcon fontSize="small" sx={{ color: "#0F766E" }} />
          </ListItemIcon>
          My Profile
        </MenuItem>
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" sx={{ color: "#0F766E" }} />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: "#DC2626" }} />
          </ListItemIcon>
          <Typography color="#DC2626">Logout</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
