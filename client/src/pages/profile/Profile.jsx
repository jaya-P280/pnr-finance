import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Stack,
  Avatar,
  IconButton,
  Badge,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import useAuth from "../../hooks/useAuth";
import { uploadProfileImage } from "../../api/user.api";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user?.first_name) {
      return user.first_name[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({
        open: true,
        message: "Please select a valid image file.",
        severity: "error",
      });
      return;
    }

    const userId = user?.user_id || user?.userId || user?.id;
    if (!userId) {
      setToast({
        open: true,
        message: "User ID not found.",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await uploadProfileImage(userId, file);
      
      const newImageUrl = response.data?.data?.profileImage || response.data?.profileImage;

      if (setUser && newImageUrl) {
        setUser((prev) => ({
          ...prev,
          profile_image: newImageUrl,
        }));
      }

      setToast({
        open: true,
        message: response.data?.message || "Profile image updated successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error("Profile image upload failed:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to upload profile image.";
      setToast({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 4,
        px: 2,
      }}
    >
      <Typography variant="h4" fontWeight={700} mb={2}>
        My Profile
      </Typography>

      <Paper sx={{ p: 4 }} elevation={2}>
        <Stack spacing={3} alignItems="center">
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <IconButton
                component="label"
                disabled={loading}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark" },
                  width: 36,
                  height: 36,
                  boxShadow: 2,
                }}
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <PhotoCameraIcon fontSize="small" />
                )}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={loading}
                />
              </IconButton>
            }
          >
            <Avatar
              src={user?.profile_image || ""}
              alt={user?.first_name || "User Avatar"}
              sx={{
                width: 100,
                height: 100,
                fontSize: "2.2rem",
                bgcolor: "primary.main",
              }}
            >
              {getInitials()}
            </Avatar>
          </Badge>

          <Stack spacing={2} sx={{ width: "100%" }}>
            <Typography variant="h6">Profile details</Typography>
            <Divider />
            <Typography>
              <strong>Name:</strong>{" "}
              {user?.first_name
                ? `${user.first_name} ${user.last_name || ""}`
                : user?.email || "-"}
            </Typography>
            <Typography>
              <strong>Email:</strong> {user?.email || "-"}
            </Typography>
            <Typography>
              <strong>Role:</strong> {user?.role_name || "-"}
            </Typography>
            <Typography>
              <strong>Status:</strong> {user?.status || "Active"}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          variant="filled"
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}