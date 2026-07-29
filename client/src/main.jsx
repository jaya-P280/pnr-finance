import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

import App from "./App";
import theme from "./theme/theme";
import { AuthProvider } from "./context/AuthContext";
import QueryProvider from "./providers/QueryProviders";
import { setupAuthInterceptors } from "./api/axios";

// Setup auth interceptors to use tokens from context (no localStorage)
setupAuthInterceptors(
  () => window.__AUTH_ACCESS_TOKEN__,
  () => window.__AUTH_REFRESH_TOKEN__,
  (accessToken, refreshToken) => {
    window.__AUTH_ACCESS_TOKEN__ = accessToken || null;
    window.__AUTH_REFRESH_TOKEN__ = refreshToken || null;
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryProvider>
      <AuthProvider>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryProvider>
  </React.StrictMode>,
);
