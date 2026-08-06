import React from "react";
import { Box, Typography, Button, Container, Paper } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 5,
          textAlign: "center",
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            backgroundColor: "error.light",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "error.main",
            mb: 1,
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 40 }} />
        </Box>

        <Typography variant="h3" fontWeight="bold" color="text.primary">
          403
        </Typography>

        <Typography variant="h5" fontWeight="600" color="text.secondary">
          Access Forbidden
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
          You do not have permission to access this module or page. Please contact your system administrator if you believe this is an error.
        </Typography>

        <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/dashboard", { replace: true })}
            sx={{ px: 4, py: 1 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
