import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  Divider,
  Grid,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import { Save as SaveIcon, Edit as EditIcon } from "@mui/icons-material";
import SectionPage from "../../components/layout/SectionPage";

export default function Settings() {
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [companySettings, setCompanySettings] = useState({
    companyName: "PNRG Finance",
    registrationNumber: "PNRG/2024/001",
    email: "contact@pnrgfinance.com",
    phone: "+91-11-XXXX-XXXX",
    address: "New Delhi, India",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
  });

  const [systemSettings, setSystemSettings] = useState({
    defaultInterestRate: "12",
    defaultProcessingFee: "2",
    maxLoanAmount: "15,00,000",
    minLoanAmount: "10,000",
    enableSMS: true,
    enableEmail: true,
    enableWhatsApp: false,
    defaultCurrency: "INR",
    financialYear: "April-March",
  });

  const handleCompanyChange = (field, value) => {
    setCompanySettings({ ...companySettings, [field]: value });
  };

  const handleSystemChange = (field, value) => {
    setSystemSettings({ ...systemSettings, [field]: value });
  };

  const handleSave = async () => {
    // TODO: API call to save settings
    console.log("Saving settings:", { companySettings, systemSettings });
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <SectionPage
      title="Settings"
      subtitle="Configure company profile, system settings, and operational parameters."
      actions={
        <Button
          variant="contained"
          startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          sx={{
            bgcolor: isEditing ? "#10B981" : "#0F766E",
            "&:hover": {
              bgcolor: isEditing ? "#059669" : "#0D9488",
            },
            borderRadius: 2,
          }}
        >
          {isEditing ? "Save Settings" : "Edit Settings"}
        </Button>
      }
    >
      {saved && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Settings saved successfully!
        </Alert>
      )}

      {/* Company Settings */}
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, p: 4, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: "#0F172A" }}>
          Company Profile
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Company Name"
              value={companySettings.companyName}
              onChange={(e) => handleCompanyChange("companyName", e.target.value)}
              disabled={!isEditing}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Registration Number"
              value={companySettings.registrationNumber}
              onChange={(e) => handleCompanyChange("registrationNumber", e.target.value)}
              disabled={!isEditing}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={companySettings.email}
              onChange={(e) => handleCompanyChange("email", e.target.value)}
              disabled={!isEditing}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={companySettings.phone}
              onChange={(e) => handleCompanyChange("phone", e.target.value)}
              disabled={!isEditing}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              value={companySettings.address}
              onChange={(e) => handleCompanyChange("address", e.target.value)}
              disabled={!isEditing}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="City"
              value={companySettings.city}
              onChange={(e) => handleCompanyChange("city", e.target.value)}
              disabled={!isEditing}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="State"
              value={companySettings.state}
              onChange={(e) => handleCompanyChange("state", e.target.value)}
              disabled={!isEditing}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Pincode"
              value={companySettings.pincode}
              onChange={(e) => handleCompanyChange("pincode", e.target.value)}
              disabled={!isEditing}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* System Settings */}
      <Paper elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 3, p: 4, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: "#0F172A" }}>
          System Settings
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Default Interest Rate"
              type="number"
              value={systemSettings.defaultInterestRate}
              onChange={(e) => handleSystemChange("defaultInterestRate", e.target.value)}
              disabled={!isEditing}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Default Processing Fee"
              type="number"
              value={systemSettings.defaultProcessingFee}
              onChange={(e) => handleSystemChange("defaultProcessingFee", e.target.value)}
              disabled={!isEditing}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Max Loan Amount"
              value={systemSettings.maxLoanAmount}
              onChange={(e) => handleSystemChange("maxLoanAmount", e.target.value)}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Min Loan Amount"
              value={systemSettings.minLoanAmount}
              onChange={(e) => handleSystemChange("minLoanAmount", e.target.value)}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!isEditing}>
              <InputLabel>Default Currency</InputLabel>
              <Select
                value={systemSettings.defaultCurrency}
                onChange={(e) => handleSystemChange("defaultCurrency", e.target.value)}
                label="Default Currency"
                sx={{
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                  },
                }}
              >
                <MenuItem value="INR">INR (₹)</MenuItem>
                <MenuItem value="USD">USD ($)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth disabled={!isEditing}>
              <InputLabel>Financial Year</InputLabel>
              <Select
                value={systemSettings.financialYear}
                onChange={(e) => handleSystemChange("financialYear", e.target.value)}
                label="Financial Year"
                sx={{
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                  },
                }}
              >
                <MenuItem value="April-March">April - March</MenuItem>
                <MenuItem value="January-December">January - December</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: "#0F172A" }}>
          Notification Settings
        </Typography>

        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={systemSettings.enableSMS}
                onChange={(e) => handleSystemChange("enableSMS", e.target.checked)}
                disabled={!isEditing}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#0F766E",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#0F766E",
                  },
                }}
              />
            }
            label="Enable SMS Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={systemSettings.enableEmail}
                onChange={(e) => handleSystemChange("enableEmail", e.target.checked)}
                disabled={!isEditing}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#0F766E",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#0F766E",
                  },
                }}
              />
            }
            label="Enable Email Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={systemSettings.enableWhatsApp}
                onChange={(e) => handleSystemChange("enableWhatsApp", e.target.checked)}
                disabled={!isEditing}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#0F766E",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#0F766E",
                  },
                }}
              />
            }
            label="Enable WhatsApp Notifications"
          />
        </Stack>
      </Paper>
    </SectionPage>
  );
}
