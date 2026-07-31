import { useState } from "react";
import { Avatar, Box, Button, Divider, Paper, Stack, TextField, Typography } from "@mui/material";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/auth.service";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const firstName = user?.firstName || user?.first_name || "";
  const lastName = user?.lastName || user?.last_name || "";
  const [form, setForm] = useState({ firstName, lastName, mobileNumber: user?.mobileNumber || user?.mobile_number || "" });
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
      setUser(updated);
      setEditing(false);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h4" fontWeight={700} mb={2}>
        My Profile
      </Typography>

      <Paper sx={{ p: 4 }} elevation={2}>
        <Stack spacing={3} alignItems="center">
          <Avatar
            src={user?.profileImage || user?.profile_image || ""}
            alt={displayName}
            sx={{
              width: 100,
              height: 100,
              fontSize: "2.2rem",
              bgcolor: "primary.main",
            }}
          >
            {initials}
          </Avatar>

          <Stack spacing={2} sx={{ width: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Profile details</Typography>
              <Button onClick={() => setEditing((value) => !value)} disabled={saving}>{editing ? "Cancel" : "Edit profile"}</Button>
            </Stack>
            <Divider />
            {editing ? <>
              <TextField label="First name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} required fullWidth />
              <TextField label="Last name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} fullWidth />
              <TextField label="Mobile number" value={form.mobileNumber} onChange={(event) => setForm({ ...form, mobileNumber: event.target.value })} fullWidth />
              <Button variant="contained" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
            </> : <>
              <Typography><strong>Name:</strong> {displayName}</Typography>
              <Typography><strong>Email:</strong> {user?.email || "-"}</Typography>
              <Typography><strong>Mobile:</strong> {form.mobileNumber || "-"}</Typography>
              <Typography><strong>Role:</strong> {user?.role || user?.role_name || "-"}</Typography>
              <Typography><strong>Status:</strong> {user?.status || "ACTIVE"}</Typography>
            </>}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
