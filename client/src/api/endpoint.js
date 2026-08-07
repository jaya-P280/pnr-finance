const ENDPOINTS = {
  HEALTH: "/health",

  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    PROFILE: "/auth/me",
  },

  PASSWORD: "/password",

  USERS: "/users",

  ROLES: "/roles",
  PERMISSIONS: "/permissions",

  BRANCHES: "/branches",

  CUSTOMERS: "/customers",
  CUSTOMER_PORTAL: "/customer",

  GROUPS: "/groups",

  LOAN_PRODUCTS: "/loan-products",
  LOAN_APPLICATIONS: "/loan-application",

  LOANS: "/loans",

  COLLECTIONS: "/collections",
  FINANCE: {
    CASHBOOK: "/finance/cashbook",
    EXPENSES: "/finance/expenses",
    INCOME: "/finance/income",
  },

  REPORTS: "/reports",
  SETTINGS: "/settings",
  DASHBOARD: "/dashboard",
  EMI: "/emi",
  AUDIT: "/audit-logs",
  ATTENDANCE: "/attendance",
  LETTERS: "/letters",
};

export default ENDPOINTS;
