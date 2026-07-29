import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import toast from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);

    try {
      await login(values);
      toast.success("Login successful");
      navigate(from, { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Unable to login.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 6,
        background:
          "linear-gradient(135deg, #F8FAFC 0%, #E0F2FE 50%, #F0F9FF 100%)",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 480,
          p: 5,
          boxShadow: "0 20px 60px rgba(15, 118, 110, 0.12)",
          borderRadius: 3,
        }}
        elevation={0}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" fontWeight={800} color="#0F766E" mb={1}>
            PNRG Finance
          </Typography>
          <Typography color="#64748B" variant="body2">
            Microfinance Loan Management System
          </Typography>
        </Box>

        <Typography variant="h5" fontWeight={700} mb={1} color="#0F172A">
          Welcome Back
        </Typography>
        <Typography color="#64748B" mb={4}>
          Sign in to access your {location.state?.role === 'SUPER_ADMIN' ? 'Super Admin' : location.state?.role === 'ADMIN' ? 'Admin' : 'Employee'} Portal
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": {
                    borderColor: "#0F766E",
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must have at least 6 characters",
                },
              })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": {
                    borderColor: "#0F766E",
                  },
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
              sx={{
                bgcolor: "#0F766E",
                height: 50,
                fontWeight: 700,
                fontSize: 16,
                borderRadius: 2,
                "&:hover": {
                  bgcolor: "#0D9488",
                },
                "&:disabled": {
                  bgcolor: "#CBD5E1",
                },
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <Typography
              variant="body2"
              sx={{ mt: 2, textAlign: "center", color: "#64748B" }}
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "#0F766E",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Create Account
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
