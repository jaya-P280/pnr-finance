import { useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Button,
  Stack,
  TextField,
  Divider,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

export default function PersonalSettingsTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const firstName = user?.firstName || user?.first_name || "User";
  const lastName = user?.lastName || user?.last_name || "";
  const name = `${firstName} ${lastName}`.trim();
  const roleName = user?.role_name || user?.role || "";

  // Personal preferences state
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    language: "en",
    timezone: "Asia/Kolkata",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePreferenceChange = (field, value) => {
    setPreferences({ ...preferences, [field]: value });
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData({ ...passwordData, [field]: value });
  };

  const handleSavePreferences = () => {
    // TODO: Implement save preferences API call
    console.log("Saving preferences:", preferences);
    setIsEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = () => {
    // TODO: Implement change password API call
    console.log("Changing password");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleEditProfile = () => {
    const profilePath = roleName === "CUSTOMER" ? "/customer/profile" : "/profile";
    navigate(profilePath);
  };

  return (
    <Box sx={{ p: 4 }}>
      {saved && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
          Preferences saved successfully!
        </Alert>
      )}

      {/* Profile Summary */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: "#0F172A" }}>
          Profile
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            p: 3,
            bgcolor: "#F8FAFC",
            borderRadius: 2,
            alignItems: { sm: "center" },
          }}
        >
          <Avatar
            src={user?.profile_image || user?.profileImage}
            sx={{ width: 72, height: 72, bgcolor: "#0F766E" }}
          >
            {firstName[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {name}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {user?.email || "No email address"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {roleName}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={handleEditProfile}
            sx={{
              borderColor: "#0F766E",
              color: "#0F766E",
              "&:hover": {
                borderColor: "#0D9488",
                bgcolor: "#F0FDFA",
              },
            }}
          >
            Edit Profile
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Change Password */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: "#0F172A" }}>
          Change Password
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} />
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
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
              type="password"
              label="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": { borderColor: "#0F766E" },
                },
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                passwordData.newPassword !== passwordData.confirmPassword
              }
              sx={{
                bgcolor: "#0F766E",
                "&:hover": { bgcolor: "#0D9488" },
                borderRadius: 2,
              }}
            >
              Update Password
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Notification Preferences */}
      <Box sx={{ mb: 4 }}>
        <Stack
          direction="row"
          sx={{ mb: 3, justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ color: "#0F172A" }}>
            Preferences
          </Typography>
          <Button
            variant="contained"
            startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
            onClick={() => (isEditing ? handleSavePreferences() : setIsEditing(true))}
            sx={{
              bgcolor: isEditing ? "#10B981" : "#0F766E",
              "&:hover": {
                bgcolor: isEditing ? "#059669" : "#0D9488",
              },
              borderRadius: 2,
            }}
          >
            {isEditing ? "Save" : "Edit"}
          </Button>
        </Stack>

        <Stack spacing={2}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.emailNotifications}
                onChange={(e) =>
                  handlePreferenceChange("emailNotifications", e.target.checked)
                }
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
            label="Email Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={preferences.smsNotifications}
                onChange={(e) =>
                  handlePreferenceChange("smsNotifications", e.target.checked)
                }
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
            label="SMS Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={preferences.pushNotifications}
                onChange={(e) =>
                  handlePreferenceChange("pushNotifications", e.target.checked)
                }
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
            label="Push Notifications"
          />
        </Stack>
      </Box>
    </Box>
  );
}
