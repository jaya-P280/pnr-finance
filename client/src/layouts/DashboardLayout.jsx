import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import { useState } from "react";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
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
      <Header open={sidebarOpen} onToggleSidebar={handleToggleSidebar} />

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
          minWidth: 0, // prevents the flex item from refusing to shrink

          mt: "80px",

          transition: (theme) =>
            theme.transitions.create("margin", {
              easing: theme.transitions.easing.easeInOut,
              duration: 350,
            }),

          px: {
            xs: 2,
            sm: 3,
            md: 4,
            lg: sidebarOpen ? 2 : 4,
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
