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
  Grid,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  AccountBalance as BrandIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Email as EmailIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await login({
        identifier: values.identifier,
        email: values.identifier,
        password: values.password,
      });
      toast.success("Welcome back! Signed in successfully.");
      navigate(from, { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Invalid credentials.";
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
        bgcolor: "#0F172A",
        backgroundImage: "radial-gradient(at 0% 0%, rgba(15, 118, 110, 0.25) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(13, 148, 136, 0.15) 0px, transparent 50%)",
        p: { xs: 2, sm: 4 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 1000,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          bgcolor: "#FFFFFF",
        }}
      >
        <Grid container sx={{ width: "100%" }}>
          {/* Left Hero Side Banner */}
          <Grid
            item
            xs={12}
            md={5}
            sx={{
              background: "linear-gradient(135deg, #0F766E 0%, #0D9488 60%, #115E59 100%)",
              color: "#FFFFFF",
              p: { xs: 4, md: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background Decorative Circles */}
            <Box
              sx={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                pointerEvents: "none",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -80,
                left: -80,
                width: 260,
                height: 260,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
                pointerEvents: "none",
              }}
            />

            <Box sx={{ position: "relative", zIndex: 2 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center",  mb: 4 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    bgcolor: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(8px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BrandIcon sx={{ color: "#FFFFFF", fontSize: 26 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800} letterSpacing="-0.5px">
                    PNRG Finance
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500 }}>
                    Enterprise Microfinance ERP
                  </Typography>
                </Box>
              </Stack>

              <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.25, mb: 2 }}>
                Empowering Communities with Smart Finance
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.6, mb: 4 }}>
                Comprehensive loan management, automated collections, real-time ledger accounting, and complete field officer audit tracking in one unified platform.
              </Typography>

              <Stack spacing={2} sx={{ my: 2 }}>
                {[
                  "Automated EMI & Penalty Calculations",
                  "Real-time Branch Cashbook & Expenses",
                  "Digital e-KYC Verification & Auditing",
                  "Multi-Role Permission Control Architecture",
                ].map((feature, i) => (
                  <Stack key={i} direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <CheckCircleIcon sx={{ fontSize: 18, color: "#5EEAD4" }} />
                    <Typography variant="caption" fontWeight={600} sx={{ color: "#E6FFFA" }}>
                      {feature}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Box sx={{ pt: 4, borderTop: "1px solid rgba(255,255,255,0.15)", position: "relative", zIndex: 2 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                <SecurityIcon sx={{ fontSize: 18, color: "#5EEAD4" }} />
                <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  256-Bit Encrypted Banking Portal
                </Typography>
              </Stack>
            </Box>
          </Grid>

          {/* Right Form Side */}
          <Grid
            item
            xs={12}
            md={7}
            sx={{
              p: { xs: 4, sm: 5, md: 6 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              bgcolor: "#FFFFFF",
            }}
          >
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: "#0F172A", mb: 0.5 }}>
                Sign In to Your Account
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                Enter your registered email address or mobile number to access the portal.
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email or Mobile Number"
                  placeholder="name@pnrgfinance.com or 9876543210"
                  autoComplete="username"
                  error={!!errors.identifier}
                  helperText={errors.identifier?.message}
                  {...register("identifier", {
                    required: "Email address or Mobile number is required",
                    validate: (val) => {
                      const trimmed = val ? val.trim() : "";
                      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
                      const isMobile = /^\+?\d{10,15}$/.test(trimmed.replace(/\s+/g, ""));
                      return isEmail || isMobile || "Enter a valid email address or 10-digit mobile number";
                    },
                  })}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon sx={{ color: "#0F766E", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2.5,
                      "& fieldset": { borderColor: "#CBD5E1" },
                      "&:hover fieldset": { borderColor: "#0F766E" },
                      "&.Mui-focused fieldset": { borderColor: "#0F766E", borderWidth: 2 },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon sx={{ color: "#0F766E", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            tabIndex={-1}
                            size="small"
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2.5,
                      "& fieldset": { borderColor: "#CBD5E1" },
                      "&:hover fieldset": { borderColor: "#0F766E" },
                      "&.Mui-focused fieldset": { borderColor: "#0F766E", borderWidth: 2 },
                    },
                  }}
                />

                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{ color: "#0F766E", "&.Mui-checked": { color: "#0F766E" } }}
                        size="small"
                      />
                    }
                    label={<Typography variant="body2" sx={{ color: "#475569", fontWeight: 500 }}>Remember Me</Typography>}
                  />

                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{
                      color: "#0F766E",
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                    onClick={() => toast.success("Please contact your Branch Manager or Admin to reset credentials.")}
                  >
                    Forgot Password?
                  </Typography>
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  fullWidth
                  sx={{
                    background: "linear-gradient(135deg, #0F766E 0%, #0D9488 100%)",
                    height: 50,
                    fontWeight: 700,
                    fontSize: 16,
                    borderRadius: 2.5,
                    boxShadow: "0 4px 14px rgba(15, 118, 110, 0.35)",
                    textTransform: "none",
                    "&:hover": {
                      background: "linear-gradient(135deg, #0D9488 0%, #115E59 100%)",
                      boxShadow: "0 6px 20px rgba(15, 118, 110, 0.45)",
                    },
                    "&:disabled": {
                      bgcolor: "#CBD5E1",
                    },
                  }}
                >
                  {loading ? "Authenticating..." : "Sign In to ERP Portal"}
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
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    Register Account
                  </Link>
                </Typography>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
