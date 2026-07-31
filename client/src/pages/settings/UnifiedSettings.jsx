import { useState } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import SectionPage from "../../components/layout/SectionPage";
import useAuth from "../../hooks/useAuth";
import PersonalSettingsTab from "./tabs/PersonalSettingsTab";
import CompanySettingsTab from "./tabs/CompanySettingsTab";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function UnifiedSettings() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  
  const roleName = user?.role_name || user?.role || "";
  const isAdmin = roleName === "ADMIN"; // Only ADMIN can access company settings, not SUPER_ADMIN

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <SectionPage
      title="Settings"
      subtitle="Manage your account preferences and system configuration"
    >
      <Paper 
        elevation={0} 
        sx={{ 
          border: "1px solid #E2E8F0", 
          borderRadius: 3,
          overflow: "hidden"
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
              },
              "& .Mui-selected": {
                color: "#0F766E",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#0F766E",
              },
            }}
          >
            <Tab label="Personal Settings" />
            {isAdmin && <Tab label="Company Settings" />}
          </Tabs>
        </Box>

        <TabPanel value={currentTab} index={0}>
          <PersonalSettingsTab />
        </TabPanel>

        {isAdmin && (
          <TabPanel value={currentTab} index={1}>
            <CompanySettingsTab />
          </TabPanel>
        )}
      </Paper>
    </SectionPage>
  );
}
