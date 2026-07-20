import { createTheme } from "@mui/material/styles";
import colors from "./colors";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: colors.primary,

    secondary: colors.secondary,

    success: colors.success,

    warning: colors.warning,

    error: colors.error,

    background: colors.background,

    sidebar: colors.sidebar,
  },

  shape: {
    borderRadius: 10,
  },

  typography: {
    fontFamily: "Roboto, sans-serif",

    h4: {
      fontWeight: 700,
    },

    h5: {
      fontWeight: 600,
    },

    h6: {
      fontWeight: 600,
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 46,
          textTransform: "none",
          boxShadow: "none",
        },
        containedPrimary: {
          boxShadow: "0 8px 20px rgba(15, 118, 110, 0.12)",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: "0 12px 30px rgba(15, 118, 110, 0.08)",
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 12px rgba(15, 118, 110, 0.08)",
          backgroundColor: "#FFFFFF",
        },
      },
    },

    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)",
          minHeight: "100vh",
        },
      },
    },
  },
});

export default theme;
