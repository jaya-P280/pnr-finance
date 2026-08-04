import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import { useState } from "react";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/SideBar";
import { DRAWER_WIDTH } from "../components/constants/layout.constants";

export default function DashboardLayout() {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const sidebarOpen = mobile ? mobileSidebarOpen : desktopSidebarOpen;

  const handleToggleSidebar = () => {
    if (mobile) {
      setMobileSidebarOpen((prev) => !prev);
      return;
    }
    setDesktopSidebarOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "#F5F7FA",
        minHeight: "100vh",
      }}
    >
      <Header
        open={sidebarOpen}
        mobile={mobile}
        onToggleSidebar={handleToggleSidebar}
      />

      <Sidebar
        mobile={mobile}
        open={sidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onToggleSidebar={handleToggleSidebar}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          mt: "80px",
          px: {
            xs: 2,
            sm: 3,
            md: 4,
          },
          py: 4,
          minHeight: "calc(100vh - 80px)",
          background: "linear-gradient(180deg,#F8FAFC 0%,#E2E8F0 100%)",
          overflowX: "hidden",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
