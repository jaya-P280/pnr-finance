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
    permission_name: "ROLE_VIEW",
    module_name: "ROLE",
    description: "View roles and their assignments",
  },
  {
    permission_name: "ROLE_CREATE",
    module_name: "ROLE",
    description: "Create roles",
  },
  {
    permission_name: "ROLE_UPDATE",
    module_name: "ROLE",
    description: "Update roles and their assignments",
  },
  {
    permission_name: "ROLE_DELETE",
    module_name: "ROLE",
    description: "Delete roles",
  },
  {
    permission_name: "PERMISSION_VIEW",
    module_name: "PERMISSION",
    description: "View available permissions",
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
    permission_name: "MANAGE_BRANCH",
    module_name: "BRANCH",
    description: "Manage branch configuration",
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
    permission_name: "CUSTOMER_KYC_VIEW",
    module_name: "CUSTOMER_KYC",
    description: "View customer KYC status and documents",
  },
  {
    permission_name: "CUSTOMER_KYC_UPLOAD",
    module_name: "CUSTOMER_KYC",
    description: "Upload customer KYC documents on behalf of a customer",
  },
  {
    permission_name: "CUSTOMER_KYC_VERIFY",
    module_name: "CUSTOMER_KYC",
    description: "Verify or reject customer KYC",
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
    permission_name: "LOAN_APPLICATION_DISBURSE",
    module_name: "LOAN_APPLICATION",
    description: "Disburse approved applications",
  },
  {
    permission_name: "LOAN_APPLICATION_DELETE",
    module_name: "LOAN_APPLICATION",
    description: "Delete loan applications",
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
    permission_name: "LOAN_DEFAULT",
    module_name: "LOAN",
    description: "Mark loans as defaulted",
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
    permission_name: "COLLECTION_DELETE",
    module_name: "COLLECTION",
    description: "Delete collections",
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
  SUPER_ADMIN: DEFAULT_PERMISSIONS.map((p) => p.permission_name), // ALL permissions
  ADMIN: DEFAULT_PERMISSIONS.map((p) => p.permission_name), // ALL permissions
  BRANCH_MANAGER: [
    "DASHBOARD_VIEW",
    "BRANCH_CREATE",
    "BRANCH_VIEW",
    "BRANCH_UPDATE",
    "MANAGE_BRANCH",
    "CUSTOMER_CREATE",
    "CUSTOMER_VIEW",
    "CUSTOMER_UPDATE",
    "CUSTOMER_DELETE",
    "CUSTOMER_KYC_VIEW",
    "CUSTOMER_KYC_UPLOAD",
    "CUSTOMER_KYC_VERIFY",
    "GROUP_VIEW",
    "GROUP_UPDATE",
    "GROUP_DELETE",
    "LOAN_PRODUCT_VIEW",
    "LOAN_APPLICATION_CREATE",
    "LOAN_APPLICATION_VIEW",
    "LOAN_APPLICATION_UPDATE",
    "LOAN_APPLICATION_VERIFY",
    "LOAN_APPLICATION_APPROVE",
    "LOAN_APPLICATION_REJECT",
    "LOAN_APPLICATION_DISBURSE",
    "LOAN_CREATE",
    "LOAN_VIEW",
    "LOAN_UPDATE",
    "LOAN_CLOSE",
    "LOAN_FORECLOSE",
    "LOAN_DEFAULT",
    "COLLECTION_CREATE",
    "COLLECTION_VIEW",
    "COLLECTION_UPDATE",
    "COLLECTION_DELETE",
    "REPORT_VIEW",
    "USER_VIEW",
  ],
  FIELD_OFFICER: [
    "DASHBOARD_VIEW",
    "BRANCH_VIEW",
    "CUSTOMER_CREATE",
    "CUSTOMER_VIEW",
    "CUSTOMER_UPDATE",
    "CUSTOMER_KYC_VIEW",
    "CUSTOMER_KYC_UPLOAD",
    "LOAN_PRODUCT_VIEW",
    "GROUP_VIEW",
    "GROUP_UPDATE",
    "LOAN_APPLICATION_CREATE",
    "LOAN_APPLICATION_VIEW",
    "LOAN_APPLICATION_UPDATE",
    "LOAN_APPLICATION_DISBURSE",
    "LOAN_VIEW",
    "COLLECTION_CREATE",
    "COLLECTION_VIEW",
    "COLLECTION_UPDATE",
  ],
  ACCOUNTANT: [
    "DASHBOARD_VIEW",
    "BRANCH_VIEW",
    "LOAN_VIEW",
    "LOAN_APPLICATION_VIEW",
    "COLLECTION_CREATE",
    "COLLECTION_VIEW",
    "COLLECTION_UPDATE",
    "REPORT_VIEW",
    "SETTINGS_VIEW",
  ],
  CUSTOMER: [
    "DASHBOARD_VIEW",
    "CUSTOMER_VIEW",
    "CUSTOMER_KYC_VIEW",
    "CUSTOMER_KYC_UPLOAD",
    "LOAN_PRODUCT_VIEW",
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

// Demo staff accounts let each branch-level role be tested immediately.
// No extra demo account is created for SUPER_ADMIN, ADMIN, or CUSTOMER.
export const DEFAULT_DEMO_USERS = [
  {
    role_name: "BRANCH_MANAGER",
    employee_code: "BM0001",
    first_name: "Branch",
    last_name: "Manager",
    email: "branchmanager@pnrgfinance.com",
    phone: "9999999997",
    password: "BranchManager@123",
  },
  {
    role_name: "FIELD_OFFICER",
    employee_code: "FO0001",
    first_name: "Field",
    last_name: "Officer",
    email: "fieldofficer@pnrgfinance.com",
    phone: "9999999996",
    password: "FieldOfficer@123",
  },
  {
    role_name: "ACCOUNTANT",
    employee_code: "ACC0001",
    first_name: "Accounts",
    last_name: "Officer",
    email: "accountant@pnrgfinance.com",
    phone: "9999999995",
    password: "Accountant@123",
  },
  {
    role_name: "CUSTOMER",
    employee_code: "CUST0001",
    first_name: "Demo",
    last_name: "Borrower",
    email: "customer@pnrgfinance.com",
    phone: "9999999994",
    password: "Customer@123",
  },
];
