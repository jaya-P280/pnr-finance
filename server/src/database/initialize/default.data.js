export const DEFAULT_ROLES = [
  {
    role_name: "SUPER_ADMIN",
    role_description: "Can only create and manage Admin accounts",
  },
  {
    role_name: "ADMIN",
    role_description: "Full system access to all modules",
  },
  {
    role_name: "BRANCH_MANAGER",
    role_description:
      "Branch-level operations, loan approvals, collection monitoring",
  },
  {
    role_name: "FIELD_OFFICER",
    role_description:
      "Customer onboarding, loan applications, collection entry",
  },
  {
    role_name: "ACCOUNTANT",
    role_description: "Financial records, reconciliation, accounting reports",
  },
  {
    role_name: "CUSTOMER",
    role_description:
      "End customer who registers via the public registration page",
  },
];

export const DEFAULT_PERMISSIONS = [
  {
    permission_name: "DASHBOARD_VIEW",
    module_name: "DASHBOARD",
    description: "View dashboard",
  },

  {
    permission_name: "USER_CREATE",
    module_name: "USER",
    description: "Create users",
  },
  {
    permission_name: "USER_VIEW",
    module_name: "USER",
    description: "View users",
  },
  {
    permission_name: "USER_UPDATE",
    module_name: "USER",
    description: "Update users",
  },
  {
    permission_name: "USER_DELETE",
    module_name: "USER",
    description: "Delete users",
  },

  {
    permission_name: "BRANCH_CREATE",
    module_name: "BRANCH",
    description: "Create branches",
  },
  {
    permission_name: "BRANCH_VIEW",
    module_name: "BRANCH",
    description: "View branches",
  },
  {
    permission_name: "BRANCH_UPDATE",
    module_name: "BRANCH",
    description: "Update branches",
  },
  {
    permission_name: "BRANCH_DELETE",
    module_name: "BRANCH",
    description: "Delete branches",
  },

  {
    permission_name: "CUSTOMER_CREATE",
    module_name: "CUSTOMER",
    description: "Create customers",
  },
  {
    permission_name: "CUSTOMER_VIEW",
    module_name: "CUSTOMER",
    description: "View customers",
  },
  {
    permission_name: "CUSTOMER_UPDATE",
    module_name: "CUSTOMER",
    description: "Update customers",
  },
  {
    permission_name: "CUSTOMER_DELETE",
    module_name: "CUSTOMER",
    description: "Delete customers",
  },

  {
    permission_name: "GROUP_CREATE",
    module_name: "GROUP",
    description: "Create groups",
  },
  {
    permission_name: "GROUP_VIEW",
    module_name: "GROUP",
    description: "View groups",
  },
  {
    permission_name: "GROUP_UPDATE",
    module_name: "GROUP",
    description: "Update groups",
  },
  {
    permission_name: "GROUP_DELETE",
    module_name: "GROUP",
    description: "Delete groups",
  },

  {
    permission_name: "LOAN_PRODUCT_CREATE",
    module_name: "LOAN_PRODUCT",
    description: "Create loan products",
  },
  {
    permission_name: "LOAN_PRODUCT_VIEW",
    module_name: "LOAN_PRODUCT",
    description: "View loan products",
  },
  {
    permission_name: "LOAN_PRODUCT_UPDATE",
    module_name: "LOAN_PRODUCT",
    description: "Update loan products",
  },
  {
    permission_name: "LOAN_PRODUCT_DELETE",
    module_name: "LOAN_PRODUCT",
    description: "Delete loan products",
  },

  {
    permission_name: "LOAN_APPLICATION_CREATE",
    module_name: "LOAN_APPLICATION",
    description: "Create applications",
  },
  {
    permission_name: "LOAN_APPLICATION_VIEW",
    module_name: "LOAN_APPLICATION",
    description: "View applications",
  },
  {
    permission_name: "LOAN_APPLICATION_UPDATE",
    module_name: "LOAN_APPLICATION",
    description: "Update applications",
  },
  {
    permission_name: "LOAN_APPLICATION_VERIFY",
    module_name: "LOAN_APPLICATION",
    description: "Verify applications",
  },
  {
    permission_name: "LOAN_APPLICATION_APPROVE",
    module_name: "LOAN_APPLICATION",
    description: "Approve applications",
  },
  {
    permission_name: "LOAN_APPLICATION_REJECT",
    module_name: "LOAN_APPLICATION",
    description: "Reject applications",
  },

  {
    permission_name: "LOAN_CREATE",
    module_name: "LOAN",
    description: "Disburse loans",
  },
  {
    permission_name: "LOAN_VIEW",
    module_name: "LOAN",
    description: "View loans",
  },
  {
    permission_name: "LOAN_UPDATE",
    module_name: "LOAN",
    description: "Update loans",
  },
  {
    permission_name: "LOAN_CLOSE",
    module_name: "LOAN",
    description: "Close loans",
  },
  {
    permission_name: "LOAN_FORECLOSE",
    module_name: "LOAN",
    description: "Foreclose loans",
  },

  {
    permission_name: "COLLECTION_CREATE",
    module_name: "COLLECTION",
    description: "Record collections",
  },
  {
    permission_name: "COLLECTION_VIEW",
    module_name: "COLLECTION",
    description: "View collections",
  },
  {
    permission_name: "COLLECTION_UPDATE",
    module_name: "COLLECTION",
    description: "Update collections",
  },

  {
    permission_name: "REPORT_VIEW",
    module_name: "REPORT",
    description: "View reports",
  },

  {
    permission_name: "SETTINGS_VIEW",
    module_name: "SETTINGS",
    description: "View settings",
  },
  {
    permission_name: "SETTINGS_UPDATE",
    module_name: "SETTINGS",
    description: "Update settings",
  },
];

// Which roles get which permissions (by permission name)
export const ROLE_PERMISSIONS_MAP = {
  SUPER_ADMIN: [
    "DASHBOARD_VIEW",
    "USER_CREATE",
    "USER_VIEW", // Can ONLY create/view ADMIN users (enforced in user.service.js)
    "SETTINGS_VIEW",
  ],
  ADMIN: DEFAULT_PERMISSIONS.map((p) => p.permission_name), // ALL permissions
  BRANCH_MANAGER: [
    "DASHBOARD_VIEW",
    "BRANCH_VIEW",
    "BRANCH_UPDATE",
    "CUSTOMER_CREATE",
    "CUSTOMER_VIEW",
    "CUSTOMER_UPDATE",
    "GROUP_CREATE",
    "GROUP_VIEW",
    "GROUP_UPDATE",
    "LOAN_PRODUCT_VIEW",
    "LOAN_APPLICATION_CREATE",
    "LOAN_APPLICATION_VIEW",
    "LOAN_APPLICATION_VERIFY",
    "LOAN_APPLICATION_APPROVE",
    "LOAN_APPLICATION_REJECT",
    "LOAN_CREATE",
    "LOAN_VIEW",
    "LOAN_UPDATE",
    "LOAN_CLOSE",
    "COLLECTION_CREATE",
    "COLLECTION_VIEW",
    "COLLECTION_UPDATE",
    "REPORT_VIEW",
  ],
  FIELD_OFFICER: [
    "DASHBOARD_VIEW",
    "CUSTOMER_CREATE",
    "CUSTOMER_VIEW",
    "CUSTOMER_UPDATE",
    "LOAN_APPLICATION_CREATE",
    "LOAN_APPLICATION_VIEW",
    "LOAN_VIEW",
    "COLLECTION_CREATE",
    "COLLECTION_VIEW",
  ],
  ACCOUNTANT: [
    "DASHBOARD_VIEW",
    "LOAN_VIEW",
    "COLLECTION_VIEW",
    "COLLECTION_UPDATE",
    "REPORT_VIEW",
  ],
  CUSTOMER: [
    "DASHBOARD_VIEW",
    "LOAN_APPLICATION_CREATE",
    "LOAN_APPLICATION_VIEW",
    "LOAN_APPLICATION_UPDATE",
    "LOAN_VIEW",
  ],
};

export const DEFAULT_BRANCH = {
  branch_code: "HQ001",
  branch_name: "Head Office",
  phone: "9999999999",
  email: "admin@pnrgfinance.com",
  address: "Head Office",
  city: "Hyderabad",
  state: "Telangana",
  pincode: "500001",
};

export const DEFAULT_ADMIN = {
  employee_code: "EMP0001",
  first_name: "System",
  last_name: "Administrator",
  email: "admin@pnrgfinance.com",
  phone: "9999999999",
  password: "Admin@123",
};

export const DEFAULT_SUPER_ADMIN = {
  employee_code: "SUP0001",
  first_name: "Super",
  last_name: "Administrator",
  email: "superadmin@pnrgfinance.com",
  phone: "9999999998",
  password: "SuperAdmin@123",
};
