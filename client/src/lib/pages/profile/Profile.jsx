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
} from "@mui/icons-material";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/auth.service";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const firstName = user?.firstName || user?.first_name || "";
  const lastName = user?.lastName || user?.last_name || "";
  const [form, setForm] = useState({
    firstName,
    lastName,
    mobileNumber: user?.mobileNumber || user?.phone || user?.mobile_number || "",
  });

  const displayName = `${form.firstName} ${form.lastName}`.trim() || user?.email || "User";
  const initials =
    `${form.firstName[0] || ""}${form.lastName[0] || ""}`.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U";

  const save = async () => {
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

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", my: 4, px: 2 }}>
      {/* HEADER CARD */}
      <Card sx={{ borderRadius: 3, mb: 3, background: "linear-gradient(135deg, #0F766E 0%, #0D9488 100%)", color: "#FFFFFF" }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ alignItems: "center" }}>
            <Avatar
              src={user?.profileImage || user?.profile_image || ""}
              alt={displayName}
              sx={{
                width: 90,
                height: 90,
                fontSize: "2.2rem",
                bgcolor: "#FFFFFF",
                color: "#0F766E",
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {initials}
            </Avatar>

            <Box sx={{ textAlign: { xs: "center", sm: "left" }, flexGrow: 1 }}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: "center", sm: "flex-start" }, alignItems: "center" }}>
                <Typography variant="h5" fontWeight={700}>
                  {displayName}
                </Typography>
                <Chip
                  label={user?.role_name || user?.role || "STAFF"}
                  size="small"
                  sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#FFFFFF", fontWeight: 700, fontSize: "0.75rem" }}
                />
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Employee Code: {user?.employee_code || user?.employeeCode || "EMP-1001"}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mt: 0.5 }}>
                Branch: {user?.branch_name || user?.branchName || "Head Office Branch"}
              </Typography>
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
                "&:hover": { bgcolor: editing ? "#DC2626" : "#F8FAFC" },
              }}
            >
              {editing ? "Cancel" : "Edit Profile"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* DETAILS CARD */}
      <Paper sx={{ p: 3.5, borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
        <Typography variant="h6" fontWeight={700} sx={{ color: "#0F172A", mb: 2 }}>
          Account & Contact Details
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {editing ? (
          <Stack spacing={2.5}>
            <Grid container spacing={2}>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="First Name"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Last Name"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Mobile Number"
                  value={form.mobileNumber}
                  onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={save}
                disabled={saving}
                sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D9488" } }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </Stack>
        ) : (
          <Grid container spacing={3}>
            <Grid xs={12} sm={6}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <PersonIcon sx={{ color: "#0F766E" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1" fontWeight={600}>{displayName}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid xs={12} sm={6}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <EmailIcon sx={{ color: "#0F766E" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Email Address</Typography>
                  <Typography variant="body1" fontWeight={600}>{user?.email || "-"}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid xs={12} sm={6}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <PhoneIcon sx={{ color: "#0F766E" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Mobile Phone</Typography>
                  <Typography variant="body1" fontWeight={600}>{form.mobileNumber || user?.phone || "-"}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid xs={12} sm={6}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <BadgeIcon sx={{ color: "#0F766E" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Assigned Role</Typography>
                  <Typography variant="body1" fontWeight={600}>{user?.role_name || user?.role || "Staff Member"}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid xs={12} sm={6}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <BranchIcon sx={{ color: "#0F766E" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Branch Name</Typography>
                  <Typography variant="body1" fontWeight={600}>{user?.branch_name || "Head Office"}</Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid xs={12} sm={6}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <SecurityIcon sx={{ color: "#0F766E" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Account Status</Typography>
                  <Typography variant="body1" fontWeight={600} color="#059669">ACTIVE & VERIFIED</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
}
