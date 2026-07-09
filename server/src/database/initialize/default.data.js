export const DEFAULT_ROLES = [
    {
        role_name: "SUPER_ADMIN",
        role_description: "Complete System Access"
    },
    {
        role_name: "BRANCH_MANAGER",
        role_description: "Manage Branch Operations"
    },
    {
        role_name: "FIELD_OFFICER",
        role_description: "Customer Operations"
    },
    {
        role_name: "ACCOUNTANT",
        role_description: "Finance Operations"
    }
];

export const DEFAULT_PERMISSIONS = [
    {
        permission_name: "USER_CREATE",
        module_name: "USER",
        description: "Create User"
    },
    {
        permission_name: "USER_UPDATE",
        module_name: "USER",
        description: "Update User"
    },
    {
        permission_name: "USER_DELETE",
        module_name: "USER",
        description: "Delete User"
    },
    {
        permission_name: "CUSTOMER_CREATE",
        module_name: "CUSTOMER",
        description: "Create Customer"
    },
    {
        permission_name: "CUSTOMER_UPDATE",
        module_name: "CUSTOMER",
        description: "Update Customer"
    },
    {
        permission_name: "CUSTOMER_DELETE",
        module_name: "CUSTOMER",
        description: "Delete Customer"
    },
    {
        permission_name: "LOAN_APPROVE",
        module_name: "LOAN",
        description: "Approve Loan"
    },
    {
        permission_name: "LOAN_REJECT",
        module_name: "LOAN",
        description: "Reject Loan"
    },
    {
        permission_name: "VIEW_REPORTS",
        module_name: "REPORT",
        description: "View Reports"
    },
    {
        permission_name: "MANAGE_BRANCH",
        module_name: "BRANCH",
        description: "Manage Branch"
    }
];

export const DEFAULT_BRANCH = {
    branch_code: "HQ001",
    branch_name: "Head Office",
    phone: "9999999999",
    email: "admin@pnrgfinance.com",
    address: "Head Office",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500001"
};

export const DEFAULT_ADMIN = {
    employee_code: "EMP0001",
    first_name: "System",
    last_name: "Administrator",
    email: "admin@pnrgfinance.com",
    phone: "9999999999",
    password: "Admin@123"
};