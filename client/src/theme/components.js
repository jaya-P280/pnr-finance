import colors from "./colors";
import shadows from "./shadows";

const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        background:
          "linear-gradient(180deg,#F8FAFC 0%,#E2E8F0 100%)",
      },
    },
  },

  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        border: `1px solid ${colors.border}`,
        boxShadow: "none",
      },
    },
  },

  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 18,
        boxShadow: shadows.card,
      },
    },
  },

  MuiButton: {
    defaultProps: {
      variant: "contained",
    },

    styleOverrides: {
      root: {
        height: 46,
        borderRadius: 10,
        textTransform: "none",
        boxShadow: "none",
        fontWeight: 600,
      },

      contained: {
        boxShadow: shadows.button,
      },
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 10,

        background: "#FFF",

        "& fieldset": {
          borderColor: colors.border,
        },

        "&:hover fieldset": {
          borderColor: colors.primary.main,
        },

        "&.Mui-focused fieldset": {
          borderColor: colors.primary.main,
          borderWidth: 2,
        },
      },
    },
  },

  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 600,
      },
    },
  },

  MuiTableCell: {
    styleOverrides: {
      head: {
        background: colors.table.header,
        fontWeight: 700,
        color: colors.text.primary,
      },
    },
  },

  MuiTableRow: {
    styleOverrides: {
      root: {
        "&:hover": {
          background: colors.table.hover,
        },
      },
    },
  },

  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 18,
      },
    },
  },
};

export default components;