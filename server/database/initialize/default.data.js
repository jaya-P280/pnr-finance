export const DEFAULT_ROLES = [
  {
    role_name: "SUPER_ADMIN",
    role_description: "Can only create and manage Administrator accounts",
  },
  {
    role_name: "ADMIN",
    role_description: "Full management of business operations",
  },
  {
    role_name: "BRANCH_MANAGER",
    role_description: "Branch-level operations, staff oversight, and approvals",
  },
  {
    role_name: "FIELD_OFFICER",
    role_description: "Field customer onboarding, verification, and collection entry",
  },
  {
    role_name: "ACCOUNTANT",
    role_description: "Financial management, cash book, expenses, and financial reporting",
  },
  {
    role_name: "CUSTOMER",
    role_description: "Self-service borrower customer portal",
  },
];

export const DEFAULT_PERMISSIONS = [
  // Administrator Management (SUPER_ADMIN ONLY)
  {
    permission_name: "ADMINISTRATOR_VIEW",
    module_name: "ADMINISTRATOR",
    description: "View administrator and employee accounts",
  },
  {
    permission_name: "ADMINISTRATOR_CREATE",
    module_name: "ADMINISTRATOR",
    description: "Create administrator accounts (Admin, BM, FO, Accountant)",
  },
  {
    permission_name: "ADMINISTRATOR_UPDATE",
    module_name: "ADMINISTRATOR",
    description: "Edit administrator account details",
  },
  {
    permission_name: "ADMINISTRATOR_DELETE",
    module_name: "ADMINISTRATOR",
    description: "Delete administrator accounts",
  },
  {
    permission_name: "ADMINISTRATOR_ACTIVATE",
    module_name: "ADMINISTRATOR",
    description: "Activate or deactivate administrator accounts",
  },
  {
    permission_name: "ADMINISTRATOR_RESET_PASSWORD",
    module_name: "ADMINISTRATOR",
    description: "Reset administrator passwords",
  },

  // Dashboard
  {
    permission_name: "DASHBOARD_VIEW",
    module_name: "DASHBOARD",
    description: "View analytics dashboard",
  },

  // Staff User Management (For Admin / Branch Manager)
  {
    permission_name: "USER_CREATE",
    module_name: "USER",
    description: "Create branch staff users",
  },
  {
    permission_name: "USER_VIEW",
    module_name: "USER",
    description: "View branch staff users",
  },
  {
    permission_name: "USER_UPDATE",
    module_name: "USER",
    description: "Update branch staff users",
  },
  {
    permission_name: "USER_DELETE",
    module_name: "USER",
    description: "Delete branch staff users",
  },

  // Roles & Permissions (View-only for Admin)
  {
    permission_name: "ROLE_VIEW",
    module_name: "ROLE",
    description: "View role definitions",
  },
  {
    permission_name: "PERMISSION_VIEW",
    module_name: "PERMISSION",
    description: "View system permission definitions",
  },

  // Audit Logs
  {
    permission_name: "AUDIT_VIEW",
    module_name: "AUDIT",
    description: "View audit trail logs",
  },

  // Branch Management
  {
    permission_name: "BRANCH_CREATE",
    module_name: "BRANCH",
    description: "Create new branches",
  },
  {
    permission_name: "BRANCH_VIEW",
    module_name: "BRANCH",
    description: "View branch details",
  },
  {
    permission_name: "BRANCH_UPDATE",
    module_name: "BRANCH",
    description: "Update branch information",
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

  // Customer Management
  {
    permission_name: "CUSTOMER_CREATE",
    module_name: "CUSTOMER",
    description: "Create new customer profiles",
  },
  {
    permission_name: "CUSTOMER_VIEW",
    module_name: "CUSTOMER",
    description: "View customer profiles",
  },
  {
    permission_name: "CUSTOMER_UPDATE",
    module_name: "CUSTOMER",
    description: "Update customer information",
  },
  {
    permission_name: "CUSTOMER_DELETE",
    module_name: "CUSTOMER",
    description: "Delete customer profiles",
  },
  {
    permission_name: "CUSTOMER_KYC_VIEW",
    module_name: "CUSTOMER_KYC",
    description: "View customer eKYC status and documents",
  },
  {
    permission_name: "CUSTOMER_KYC_UPLOAD",
    module_name: "CUSTOMER_KYC",
    description: "Upload customer eKYC documents",
  },
  {
    permission_name: "CUSTOMER_KYC_VERIFY",
    module_name: "CUSTOMER_KYC",
    description: "Verify or reject customer eKYC",
  },

  // Groups
  {
    permission_name: "GROUP_CREATE",
    module_name: "GROUP",
    description: "Create customer self-help groups",
  },
  {
    permission_name: "GROUP_VIEW",
    module_name: "GROUP",
    description: "View customer groups",
  },
  {
    permission_name: "GROUP_UPDATE",
    module_name: "GROUP",
    description: "Update group details and assignments",
  },
  {
    permission_name: "GROUP_DELETE",
    module_name: "GROUP",
    description: "Delete customer groups",
  },

  // Loan Products
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

  // Loan Applications
  {
    permission_name: "LOAN_APPLICATION_CREATE",
    module_name: "LOAN_APPLICATION",
    description: "Apply for loans",
  },
  {
    permission_name: "LOAN_APPLICATION_VIEW",
    module_name: "LOAN_APPLICATION",
    description: "View loan applications",
  },
  {
    permission_name: "LOAN_APPLICATION_UPDATE",
    module_name: "LOAN_APPLICATION",
    description: "Update loan applications",
  },
  {
    permission_name: "LOAN_APPLICATION_VERIFY",
    module_name: "LOAN_APPLICATION",
    description: "Verify loan applications",
  },
  {
    permission_name: "LOAN_APPLICATION_APPROVE",
    module_name: "LOAN_APPLICATION",
    description: "Approve loan applications",
  },
  {
    permission_name: "LOAN_APPLICATION_REJECT",
    module_name: "LOAN_APPLICATION",
    description: "Reject loan applications",
  },
  {
    permission_name: "LOAN_APPLICATION_DISBURSE",
    module_name: "LOAN_APPLICATION",
    description: "Disburse approved loan applications",
  },
  {
    permission_name: "LOAN_APPLICATION_DELETE",
    module_name: "LOAN_APPLICATION",
    description: "Delete loan applications",
  },

  // Loans
  {
    permission_name: "LOAN_CREATE",
    module_name: "LOAN",
    description: "Create active loan contracts",
  },
  {
    permission_name: "LOAN_VIEW",
    module_name: "LOAN",
    description: "View active loans",
  },
  {
    permission_name: "LOAN_UPDATE",
    module_name: "LOAN",
    description: "Update loan records",
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

  // Collections
  {
    permission_name: "COLLECTION_CREATE",
    module_name: "COLLECTION",
    description: "Record repayments and EMI collections",
  },
  {
    permission_name: "COLLECTION_VIEW",
    module_name: "COLLECTION",
    description: "View collection entries",
  },
  {
    permission_name: "COLLECTION_UPDATE",
    module_name: "COLLECTION",
    description: "Update collection entries",
  },
  {
    permission_name: "COLLECTION_DELETE",
    module_name: "COLLECTION",
    description: "Delete collection entries",
  },

  // Finance
  {
    permission_name: "CASHBOOK_VIEW",
    module_name: "FINANCE",
    description: "View cash book entries",
  },
  {
    permission_name: "EXPENSE_VIEW",
    module_name: "FINANCE",
    description: "View expense entries",
  },
  {
    permission_name: "EXPENSE_CREATE",
    module_name: "FINANCE",
    description: "Create expense entries",
  },
  {
    permission_name: "INCOME_VIEW",
    module_name: "FINANCE",
    description: "View income entries",
  },
  {
    permission_name: "INCOME_CREATE",
    module_name: "FINANCE",
    description: "Create income entries",
  },

  // Reports
  {
    permission_name: "REPORT_VIEW",
    module_name: "REPORT",
    description: "View business and financial reports",
  },

  // Settings
  {
    permission_name: "SETTINGS_VIEW",
    module_name: "SETTINGS",
    description: "View system configuration settings",
  },
  {
    permission_name: "SETTINGS_UPDATE",
    module_name: "SETTINGS",
    description: "Update system configuration settings",
  },
];

// Mapping roles strictly to permissions according to enterprise RBAC spec
export const ROLE_PERMISSIONS_MAP = {
  SUPER_ADMIN: [
    "DASHBOARD_VIEW",
    "ADMINISTRATOR_VIEW",
    "ADMINISTRATOR_CREATE",
    "ADMINISTRATOR_UPDATE",
    "ADMINISTRATOR_DELETE",
    "ADMINISTRATOR_ACTIVATE",
    "ADMINISTRATOR_RESET_PASSWORD",
  ],
  ADMIN: [
    "DASHBOARD_VIEW",
    "USER_VIEW",
    "USER_CREATE",
    "USER_UPDATE",
    "USER_DELETE",
    "ROLE_VIEW",
    "PERMISSION_VIEW",
    "AUDIT_VIEW",
    "BRANCH_VIEW",
    "BRANCH_CREATE",
    "BRANCH_UPDATE",
    "BRANCH_DELETE",
    "MANAGE_BRANCH",
    "CUSTOMER_VIEW",
    "CUSTOMER_CREATE",
    "CUSTOMER_UPDATE",
    "CUSTOMER_DELETE",
    "CUSTOMER_KYC_VIEW",
    "CUSTOMER_KYC_UPLOAD",
    "CUSTOMER_KYC_VERIFY",
    "GROUP_VIEW",
    "GROUP_CREATE",
    "GROUP_UPDATE",
    "GROUP_DELETE",
    "LOAN_PRODUCT_VIEW",
    "LOAN_PRODUCT_CREATE",
    "LOAN_PRODUCT_UPDATE",
    "LOAN_PRODUCT_DELETE",
    "LOAN_APPLICATION_VIEW",
    "LOAN_APPLICATION_CREATE",
    "LOAN_APPLICATION_UPDATE",
    "LOAN_APPLICATION_VERIFY",
    "LOAN_APPLICATION_APPROVE",
    "LOAN_APPLICATION_REJECT",
    "LOAN_APPLICATION_DISBURSE",
    "LOAN_APPLICATION_DELETE",
    "LOAN_VIEW",
    "LOAN_CREATE",
    "LOAN_UPDATE",
    "LOAN_CLOSE",
    "LOAN_FORECLOSE",
    "LOAN_DEFAULT",
    "COLLECTION_VIEW",
    "COLLECTION_CREATE",
    "COLLECTION_UPDATE",
    "COLLECTION_DELETE",
    "CASHBOOK_VIEW",
    "EXPENSE_VIEW",
    "EXPENSE_CREATE",
    "INCOME_VIEW",
    "INCOME_CREATE",
    "REPORT_VIEW",
    "SETTINGS_VIEW",
    "SETTINGS_UPDATE",
  ],
  BRANCH_MANAGER: [
    "DASHBOARD_VIEW",
    "USER_VIEW",
    "BRANCH_VIEW",
    "CUSTOMER_VIEW",
    "CUSTOMER_CREATE",
    "CUSTOMER_UPDATE",
    "CUSTOMER_KYC_VIEW",
    "CUSTOMER_KYC_UPLOAD",
    "CUSTOMER_KYC_VERIFY",
    "GROUP_VIEW",
    "GROUP_CREATE",
    "GROUP_UPDATE",
    "GROUP_DELETE",
    "LOAN_PRODUCT_VIEW",
    "LOAN_APPLICATION_VIEW",
    "LOAN_APPLICATION_VERIFY",
    "LOAN_APPLICATION_APPROVE",
    "LOAN_APPLICATION_REJECT",
    "LOAN_VIEW",
    "COLLECTION_VIEW",
    "COLLECTION_CREATE",
    "REPORT_VIEW",
  ],
  FIELD_OFFICER: [
    "DASHBOARD_VIEW",
    "CUSTOMER_VIEW",
    "CUSTOMER_CREATE",
    "CUSTOMER_UPDATE",
    "CUSTOMER_KYC_VIEW",
    "CUSTOMER_KYC_UPLOAD",
    "GROUP_VIEW",
    "GROUP_UPDATE",
    "LOAN_PRODUCT_VIEW",
    "LOAN_APPLICATION_VIEW",
    "LOAN_APPLICATION_CREATE",
    "LOAN_APPLICATION_UPDATE",
    "LOAN_APPLICATION_VERIFY",
    "LOAN_APPLICATION_DISBURSE",
    "LOAN_VIEW",
    "COLLECTION_VIEW",
    "COLLECTION_CREATE",
  ],
  ACCOUNTANT: [
    "DASHBOARD_VIEW",
    "CASHBOOK_VIEW",
    "EXPENSE_VIEW",
    "EXPENSE_CREATE",
    "INCOME_VIEW",
    "INCOME_CREATE",
    "COLLECTION_VIEW",
    "COLLECTION_CREATE",
    "COLLECTION_UPDATE",
    "REPORT_VIEW",
    "LOAN_VIEW",
  ],
  CUSTOMER: [
    "DASHBOARD_VIEW",
    "CUSTOMER_VIEW",
    "CUSTOMER_KYC_VIEW",
    "CUSTOMER_KYC_UPLOAD",
    "LOAN_PRODUCT_VIEW",
    "LOAN_APPLICATION_CREATE",
    "LOAN_APPLICATION_VIEW",
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
