import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Grid,
  Checkbox,
  FormControlLabel,
  Chip,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  PersonAdd as RegisterIcon,
  AccountBalance as BrandIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Badge as BadgeIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import authService from "../../services/auth.service";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
    role: "CUSTOMER",
  });

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() && !form.mobileNumber.trim())
      return toast.error("Please provide either an Email address or Mobile Phone number.");
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return toast.error("Please enter a valid Email address.");
    if (form.mobileNumber.trim() && !/^\+?\d{10,15}$/.test(form.mobileNumber.trim().replace(/\s+/g, "")))
      return toast.error("Please enter a valid 10-digit Mobile Phone number.");
    if (form.password !== form.confirmPassword)
      return toast.error("Passwords do not match.");
    if (form.password.length < 6)
      return toast.error("Password must be at least 6 characters.");
    if (!termsAccepted)
      return toast.error("Please accept terms and conditions.");

    setLoading(true);
    try {
      await authService.register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || undefined,
        password: form.password,
        mobileNumber: form.mobileNumber.trim() || undefined,
        role: form.role,
      });
      setSuccess(true);
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#0F172A",
          p: 3,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            maxWidth: 500,
            width: "100%",
            borderRadius: 4,
            p: 5,
            textAlign: "center",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: "#DCFCE7",
              color: "#16A34A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 44 }} />
          </Box>
          <Typography variant="h5" fontWeight={800} color="#0F172A" gutterBottom>
            Registration Successful!
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
            Your customer account for <strong>{form.email}</strong> has been created. You can now log into your Customer Portal to view and apply for loans.
          </Typography>

          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate("/login")}
            sx={{
              background: "linear-gradient(135deg, #0F766E 0%, #0D9488 100%)",
              py: 1.5,
              fontWeight: 700,
              fontSize: 16,
              borderRadius: 2.5,
              textTransform: "none",
            }}
          >
            Proceed to Sign In
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#0F172A",
        backgroundImage: "radial-gradient(at 0% 0%, rgba(15, 118, 110, 0.2) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(13, 148, 136, 0.15) 0px, transparent 50%)",
        py: { xs: 4, md: 8 },
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            bgcolor: "#FFFFFF",
          }}
        >
          {/* Header Banner */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #0F766E 0%, #0D9488 100%)",
              color: "#FFFFFF",
              px: { xs: 3, sm: 5 },
              py: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              textAlign: "center",
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "center" }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(8px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BrandIcon sx={{ fontSize: 28, color: "#FFFFFF" }} />
              </Box>
              <Box sx={{ textAlign: "left" }}>
                <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px">
                  PNRG Finance
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500 }}>
                  Customer Self-Registration
                </Typography>
              </Box>
            </Stack>

            <Chip
              icon={<SecurityIcon sx={{ color: "#5EEAD4 !important", fontSize: 16 }} />}
              label="Customer Registration Portal"
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.75rem",
              }}
            />
          </Box>

          {/* Form Body */}
          <Box sx={{ p: { xs: 3, sm: 5 } }}>
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: "#0F172A", mb: 0.5 }}>
                Create Customer Account
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                Provide your details below to register as a customer and apply for microfinance loans.
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="First Name"
                    value={form.firstName}
                    onChange={handleChange("firstName")}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: "#0F766E", fontSize: 20 }} />
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
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={form.lastName}
                    onChange={handleChange("lastName")}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: "#0F766E", fontSize: 20 }} />
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
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email Address"
                    placeholder="name@example.com"
                    helperText="Required if Mobile Phone is not provided"
                    value={form.email}
                    onChange={handleChange("email")}
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
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile Phone"
                    placeholder="9876543210"
                    helperText="10-digit phone number"
                    value={form.mobileNumber}
                    onChange={handleChange("mobileNumber")}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon sx={{ color: "#0F766E", fontSize: 20 }} />
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
                </Grid>


                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    type={showPwd ? "text" : "password"}
                    label="Password"
                    value={form.password}
                    onChange={handleChange("password")}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: "#0F766E", fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPwd(!showPwd)} edge="end" size="small">
                              {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
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
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    type={showPwd ? "text" : "password"}
                    label="Confirm Password"
                    value={form.confirmPassword}
                    onChange={handleChange("confirmPassword")}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: "#0F766E", fontSize: 20 }} />
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
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        sx={{ color: "#0F766E", "&.Mui-checked": { color: "#0F766E" } }}
                      />
                    }
                    label={
                      <Typography variant="body2" color="#475569">
                        I agree to PNRG Finance internal operational policies & data security protocols.
                      </Typography>
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{
                      background: "linear-gradient(135deg, #0F766E 0%, #0D9488 100%)",
                      py: 1.6,
                      fontWeight: 700,
                      fontSize: 16,
                      borderRadius: 2.5,
                      textTransform: "none",
                      boxShadow: "0 4px 14px rgba(15, 118, 110, 0.35)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #0D9488 0%, #115E59 100%)",
                        boxShadow: "0 6px 20px rgba(15, 118, 110, 0.45)",
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Complete Account Registration"}
                  </Button>
                </Grid>
              </Grid>
            </form>

            <Typography variant="body2" sx={{ mt: 4, textAlign: "center", color: "#64748B" }}>
              Already registered with PNRG Finance?{" "}
              <Link to="/login" style={{ color: "#0F766E", fontWeight: 700, textDecoration: "none" }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
