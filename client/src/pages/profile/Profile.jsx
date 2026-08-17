import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Person as PersonIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BranchIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Notifications as NotifIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/auth.service";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Profile Edit State
  const firstName = user?.firstName || user?.first_name || "";
  const lastName = user?.lastName || user?.last_name || "";
  const [form, setForm] = useState({
    firstName,
    lastName,
    mobileNumber: user?.mobileNumber || user?.phone || user?.mobile_number || "",
  });

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Preferences State
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
  });

  const displayName = `${form.firstName} ${form.lastName}`.trim() || user?.email || "User";
  const initials =
    `${form.firstName[0] || ""}${form.lastName[0] || ""}`.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const saveProfile = async () => {
    if (!form.firstName.trim()) return toast.error("First name is required.");
    setSaving(true);
    try {
      const updated = await authService.updateProfile(form);
      setUser({ ...user, ...updated });
      setEditing(false);
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword) return toast.error("Please enter your current password.");
    if (!passwords.newPassword) return toast.error("Please enter a new password.");
    if (passwords.newPassword !== passwords.confirmPassword) {
      return toast.error("New passwords do not match.");
    }
    if (passwords.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters.");
    }

    setSavingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", my: 3, px: 2 }}>
      {/* 1. HERO GRADIENT HEADER */}
      <Card
        sx={{
          borderRadius: 4,
          mb: 3,
          background: "linear-gradient(135deg, #0F766E 0%, #0D9488 50%, #0284C7 100%)",
          color: "#FFFFFF",
          boxShadow: "0 10px 30px rgba(15, 118, 110, 0.2)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ alignItems: "center" }}>
            <Avatar
              src={user?.profileImage || user?.profile_image || ""}
              alt={displayName}
              sx={{
                width: 96,
                height: 96,
                fontSize: "2.4rem",
                bgcolor: "#FFFFFF",
                color: "#0F766E",
                fontWeight: 800,
                boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
                border: "3px solid rgba(255, 255, 255, 0.4)",
              }}
            >
              {initials}
            </Avatar>

            <Box sx={{ textAlign: { xs: "center", sm: "left" }, flexGrow: 1 }}>
              <Stack direction="row" spacing={1.5} sx={{ justifyContent: { xs: "center", sm: "flex-start" }, alignItems: "center", mb: 0.5 }}>
                <Typography variant="h4" fontWeight={800} letterSpacing="-0.5px">
                  {displayName}
                </Typography>
                <Chip
                  label={user?.role_name || user?.role || "STAFF"}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.22)",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                />
              </Stack>

              <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                {user?.email || "staff@pnrfinance.com"}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mt: 1.5, justifyContent: { xs: "center", sm: "flex-start" }, flexWrap: "wrap", gap: 1 }}>
                <Chip
                  size="small"
                  label={`Emp Code: ${user?.employee_code || user?.employeeCode || "EMP-1001"}`}
                  sx={{ bgcolor: "rgba(0,0,0,0.15)", color: "#E0F2FE", fontWeight: 700, fontSize: "0.75rem" }}
                />
                <Chip
                  size="small"
                  label={`Branch: ${user?.branch_name || user?.branchName || "Head Office"}`}
                  sx={{ bgcolor: "rgba(0,0,0,0.15)", color: "#E0F2FE", fontWeight: 700, fontSize: "0.75rem" }}
                />
              </Stack>
            </Box>

            <Button
              variant="contained"
              startIcon={editing ? <CancelIcon /> : <EditIcon />}
              onClick={() => setEditing(!editing)}
              disabled={saving}
              sx={{
                bgcolor: editing ? "#EF4444" : "#FFFFFF",
                color: editing ? "#FFFFFF" : "#0F766E",
                fontWeight: 700,
                borderRadius: 2.5,
                px: 3,
                py: 1,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                "&:hover": { bgcolor: editing ? "#DC2626" : "#F8FAFC" },
              }}
            >
              {editing ? "Cancel Edit" : "Edit Profile"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* 2. ACCOUNT & CONTACT DETAILS CARD */}
      <Paper sx={{ p: 3.5, mb: 3, borderRadius: 3.5, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: "#0F172A", mb: 0.5 }}>
          Personal & Account Information
        </Typography>
        <Typography variant="body2" color="#64748B" sx={{ mb: 2.5 }}>
          Your verified employee credentials and contact parameters.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {editing ? (
          <Stack spacing={2.5}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="First Name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "#F8FAFC" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Last Name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "#F8FAFC" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mobile Number"
                  value={form.mobileNumber}
                  onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "#F8FAFC" } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email Address (Read-Only)"
                  value={user?.email || ""}
                  disabled
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "#F1F5F9" } }}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={() => setEditing(false)} sx={{ borderRadius: 2 }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={saveProfile}
                disabled={saving}
                sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D9488" }, borderRadius: 2, px: 3, fontWeight: 700 }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </Stack>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "#F0FDF4", color: "#0F766E", display: "flex" }}>
                  <PersonIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Full Name</Typography>
                  <Typography variant="body1" fontWeight={700} color="#0F172A">{displayName}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "#E0F2FE", color: "#0284C7", display: "flex" }}>
                  <EmailIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Email Address</Typography>
                  <Typography variant="body1" fontWeight={700} color="#0F172A">{user?.email || "-"}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "#FEF3C7", color: "#B45309", display: "flex" }}>
                  <PhoneIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Mobile Phone</Typography>
                  <Typography variant="body1" fontWeight={700} color="#0F172A">{form.mobileNumber || user?.phone || "+91 9876543210"}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "#F3E8FF", color: "#7C3AED", display: "flex" }}>
                  <BadgeIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Assigned System Role</Typography>
                  <Typography variant="body1" fontWeight={700} color="#0F172A">{user?.role_name || user?.role || "Staff Member"}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "#CCFBF1", color: "#0D9488", display: "flex" }}>
                  <BranchIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Branch Location</Typography>
                  <Typography variant="body1" fontWeight={700} color="#0F172A">{user?.branch_name || "Head Office Branch"}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "#ECFDF5", color: "#059669", display: "flex" }}>
                  <SecurityIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Account Status</Typography>
                  <Typography variant="body1" fontWeight={800} color="#059669">ACTIVE & VERIFIED</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* 3. SECURITY & CHANGE PASSWORD CARD */}
      <Paper sx={{ p: 3.5, mb: 3, borderRadius: 3.5, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
          <LockIcon sx={{ color: "#0F766E" }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: "#0F172A" }}>
            Security & Change Password
          </Typography>
        </Stack>
        <Typography variant="body2" color="#64748B" sx={{ mb: 2.5 }}>
          Update your account password to maintain system access security.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Box component="form" onSubmit={handleChangePassword}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type={showCurrent ? "text" : "password"}
                label="Current Password"
                placeholder="Enter current password"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowCurrent(!showCurrent)}>
                        {showCurrent ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "#F8FAFC" } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type={showNew ? "text" : "password"}
                label="New Password"
                placeholder="At least 6 characters"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowNew(!showNew)}>
                        {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "#F8FAFC" } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                type={showConfirm ? "text" : "password"}
                label="Confirm New Password"
                placeholder="Repeat new password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2.5, bgcolor: "#F8FAFC" } }}
              />
            </Grid>

            <Grid item xs={12} sm={6} sx={{ display: "flex", alignItems: "center" }}>
              <Button
                type="submit"
                variant="contained"
                disabled={savingPassword}
                sx={{
                  bgcolor: "#0F766E",
                  "&:hover": { bgcolor: "#0D9488" },
                  borderRadius: 2.5,
                  px: 3.5,
                  py: 1,
                  fontWeight: 700,
                }}
              >
                {savingPassword ? "Updating Password..." : "Update Password"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* 4. PREFERENCES & NOTIFICATION SETTINGS CARD */}
      <Paper sx={{ p: 3.5, borderRadius: 3.5, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
          <NotifIcon sx={{ color: "#0F766E" }} />
          <Typography variant="h6" fontWeight={700} sx={{ color: "#0F172A" }}>
            Notification Preferences
          </Typography>
        </Stack>
        <Typography variant="body2" color="#64748B" sx={{ mb: 2.5 }}>
          Configure operational alerts and message dispatch notifications.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #E2E8F0", borderRadius: 3, bgcolor: "#F8FAFC" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.email}
                    onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>Email Alerts</Typography>
                    <Typography variant="caption" color="text.secondary">Daily digests & audit receipts</Typography>
                  </Box>
                }
              />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #E2E8F0", borderRadius: 3, bgcolor: "#F8FAFC" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.sms}
                    onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>SMS Broadcasts</Typography>
                    <Typography variant="caption" color="text.secondary">Immediate OTP & Loan alerts</Typography>
                  </Box>
                }
              />
            </Paper>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ p: 2, border: "1px solid #E2E8F0", borderRadius: 3, bgcolor: "#F8FAFC" }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.push}
                    onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>Push Notifications</Typography>
                    <Typography variant="caption" color="text.secondary">Real-time mobile & browser alerts</Typography>
                  </Box>
                }
              />
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
