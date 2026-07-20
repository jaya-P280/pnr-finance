import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import passwordService from "../../services/password.service";

export default function PasswordSetup() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [state, setState] = useState({
    loading: true,
    valid: false,
    password: "",
    confirmPassword: "",
    error: "",
    saving: false,
  });

  useEffect(() => {
    passwordService
      .verifyToken(token)
      .then(() =>
        setState((current) => ({ ...current, loading: false, valid: true })),
      )
      .catch((error) =>
        setState((current) => ({
          ...current,
          loading: false,
          error:
            error?.response?.data?.message ||
            "This password setup link is invalid or expired.",
        })),
      );
  }, [token]);

  const submit = async (event) => {
    event.preventDefault();
    if (state.password !== state.confirmPassword)
      return setState((current) => ({
        ...current,
        error: "Passwords do not match.",
      }));
    setState((current) => ({ ...current, saving: true, error: "" }));
    try {
      await passwordService.setup({
        token,
        password: state.password,
        confirmPassword: state.confirmPassword,
      });
      navigate("/login", { replace: true });
    } catch (error) {
      setState((current) => ({
        ...current,
        saving: false,
        error: error?.response?.data?.message || "Unable to set password.",
      }));
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
        bgcolor: "#F8FAFC",
      }}
    >
      <Paper
        component="form"
        onSubmit={submit}
        sx={{ width: "100%", maxWidth: 440, p: 4 }}
      >
        <Stack spacing={2}>
          <Typography variant="h5">Set your password</Typography>
          <Typography color="text.secondary">
            Choose a secure password to activate your account.
          </Typography>
          {state.error && <Alert severity="error">{state.error}</Alert>}
          <TextField
            label="New password"
            type="password"
            required
            disabled={state.loading || !state.valid}
            value={state.password}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            helperText="At least 8 characters with uppercase, lowercase, number, and symbol."
          />
          <TextField
            label="Confirm password"
            type="password"
            required
            disabled={state.loading || !state.valid}
            value={state.confirmPassword}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                confirmPassword: event.target.value,
              }))
            }
          />
          <Button
            type="submit"
            variant="contained"
            disabled={state.loading || !state.valid || state.saving}
          >
            {state.saving ? "Saving…" : "Set password"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
