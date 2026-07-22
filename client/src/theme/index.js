import { createTheme } from "@mui/material/styles";

import colors from "./colors";
import typography from "./typography";
import components from "./components";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: colors.primary,

    secondary: colors.secondary,

    success: colors.success,

    warning: colors.warning,

    error: colors.error,

    info: colors.info,

    background: colors.background,

    text: colors.text,
  },

  typography,

  shape: {
    borderRadius: 10,
  },

  components,
});

export default theme;
