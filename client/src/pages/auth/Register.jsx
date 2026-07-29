import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Button, Card, CardContent, TextField, Typography,
  Stack, Alert, CircularProgress, InputAdornment, IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import authService from "../../services/auth.service";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirmPassword: "", mobileNumber: "",
  });

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword)
      return toast.error("Passwords do not match.");
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters.");

    setLoading(true);
    try {
      await authService.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        mobileNumber: form.mobileNumber,
      });
      setSuccess(true);
      toast.success("Registration successful!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", bgcolor: "#F0FDF4" }}>
        <Card sx={{ maxWidth: 440, width: "100%", mx: 2, borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" fontWeight={700} color="#16A34A" gutterBottom>
              ✓ Registration Successful!
            </Typography>
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              Your account is created. You can now log in.
            </Alert>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/login")}
              sx={{ bgcolor: "#16A34A", "&:hover": { bgcolor: "#15803D" }, borderRadius: 2, py: 1.5 }}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "100vh", bgcolor: "#F8FAFC",
    }}>
      <Card sx={{ maxWidth: 480, width: "100%", mx: 2, borderRadius: 3, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} color="#0F172A" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
            Register to join PNRG Finance.
          </Typography>

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  fullWidth required label="First Name"
                  value={form.firstName} onChange={handleChange("firstName")}
                  size="small"
                />
                <TextField
                  fullWidth label="Last Name"
                  value={form.lastName} onChange={handleChange("lastName")}
                  size="small"
                />
              </Stack>
              <TextField
                fullWidth required type="email" label="Email"
                value={form.email} onChange={handleChange("email")}
                size="small"
              />
              <TextField
                fullWidth label="Mobile Number" placeholder="+91XXXXXXXXXX"
                value={form.mobileNumber} onChange={handleChange("mobileNumber")}
                size="small"
              />
              <TextField
                fullWidth required type={showPwd ? "text" : "password"}
                label="Password"
                value={form.password} onChange={handleChange("password")}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd(!showPwd)} edge="end" size="small">
                        {showPwd ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth required type="password" label="Confirm Password"
                value={form.confirmPassword} onChange={handleChange("confirmPassword")}
                size="small"
              />
              <Button
                type="submit" variant="contained" fullWidth disabled={loading}
                sx={{ bgcolor: "#0F766E", "&:hover": { bgcolor: "#0D9488" }, borderRadius: 2, py: 1.5 }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Register"}
              </Button>
            </Stack>
          </form>

          <Typography variant="body2" sx={{ mt: 3, textAlign: "center", color: "#64748B" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#0F766E", fontWeight: 600, textDecoration: "none" }}>
              Sign In
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}