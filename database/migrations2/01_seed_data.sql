-- ================================================================
-- Seed Data: Roles, Permissions, and Super Admin
-- ================================================================

-- ROLES
INSERT INTO roles (role_name, description, is_system) VALUES
('SUPER_ADMIN', 'Can only create and manage Admin accounts', 1),
('ADMIN', 'Full system access to all modules', 1),
('BRANCH_MANAGER', 'Branch-level operations, loan approvals, collection monitoring', 1),
('FIELD_OFFICER', 'Customer onboarding, loan applications, collection entry', 1),
('ACCOUNTANT', 'Financial records, reconciliation, accounting reports', 1);

-- PERMISSIONS
INSERT INTO permissions (permission_name, module, description) VALUES
('DASHBOARD_VIEW', 'Dashboard', 'View dashboard and analytics'),

('USER_CREATE', 'Users', 'Create users'),
('USER_VIEW', 'Users', 'View users'),
('USER_UPDATE', 'Users', 'Update users'),
('USER_DELETE', 'Users', 'Delete users'),

('BRANCH_CREATE', 'Branches', 'Create branches'),
('BRANCH_VIEW', 'Branches', 'View branches'),
('BRANCH_UPDATE', 'Branches', 'Update branches'),
('BRANCH_DELETE', 'Branches', 'Delete branches'),

('CUSTOMER_CREATE', 'Customers', 'Create customers'),
('CUSTOMER_VIEW', 'Customers', 'View customers'),
('CUSTOMER_UPDATE', 'Customers', 'Update customers'),
('CUSTOMER_DELETE', 'Customers', 'Delete customers'),
('CUSTOMER_KYC_VERIFY', 'Customers', 'Verify customer KYC documents'),

('GROUP_CREATE', 'Groups', 'Create groups'),
('GROUP_VIEW', 'Groups', 'View groups'),
('GROUP_UPDATE', 'Groups', 'Update groups'),
('GROUP_DELETE', 'Groups', 'Delete groups'),

('LOAN_PRODUCT_CREATE', 'Loan Products', 'Create loan products'),
('LOAN_PRODUCT_VIEW', 'Loan Products', 'View loan products'),
('LOAN_PRODUCT_UPDATE', 'Loan Products', 'Update loan products'),
('LOAN_PRODUCT_DELETE', 'Loan Products', 'Delete loan products'),

('LOAN_APPLICATION_CREATE', 'Loan Applications', 'Create loan applications'),
('LOAN_APPLICATION_VIEW', 'Loan Applications', 'View loan applications'),
('LOAN_APPLICATION_UPDATE', 'Loan Applications', 'Update loan applications'),
('LOAN_APPLICATION_VERIFY', 'Loan Applications', 'Verify loan applications'),
('LOAN_APPLICATION_APPROVE', 'Loan Applications', 'Approve loan applications'),
('LOAN_APPLICATION_REJECT', 'Loan Applications', 'Reject loan applications'),

('LOAN_CREATE', 'Loans', 'Disburse loans'),
('LOAN_VIEW', 'Loans', 'View loans'),
('LOAN_UPDATE', 'Loans', 'Update loans'),
('LOAN_CLOSE', 'Loans', 'Close loans'),
('LOAN_FORECLOSE', 'Loans', 'Foreclose loans'),

('COLLECTION_CREATE', 'Collections', 'Record collections'),
('COLLECTION_VIEW', 'Collections', 'View collections'),
('COLLECTION_UPDATE', 'Collections', 'Update collections'),

('REPORT_VIEW', 'Reports', 'View reports'),

('SETTINGS_VIEW', 'Settings', 'View settings'),
('SETTINGS_UPDATE', 'Settings', 'Update settings');

-- ROLE-PERMISSION MAPPING

-- SUPER_ADMIN: Only can create ADMIN users
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r, permissions p
WHERE r.role_name = 'SUPER_ADMIN'
AND p.permission_name IN ('USER_CREATE', 'USER_VIEW', 'SETTINGS_VIEW', 'DASHBOARD_VIEW');

-- ADMIN: Full access to everything
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r, permissions p
WHERE r.role_name = 'ADMIN';

-- BRANCH_MANAGER: Branch-level access
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r, permissions p
WHERE r.role_name = 'BRANCH_MANAGER'
AND p.permission_name IN (
  'DASHBOARD_VIEW',
  'BRANCH_VIEW', 'BRANCH_UPDATE',
  'CUSTOMER_CREATE', 'CUSTOMER_VIEW', 'CUSTOMER_UPDATE',
  'GROUP_CREATE', 'GROUP_VIEW', 'GROUP_UPDATE',
  'LOAN_PRODUCT_VIEW',
  'LOAN_APPLICATION_CREATE', 'LOAN_APPLICATION_VIEW',
  'LOAN_APPLICATION_VERIFY', 'LOAN_APPLICATION_APPROVE', 'LOAN_APPLICATION_REJECT',
  'LOAN_CREATE', 'LOAN_VIEW', 'LOAN_UPDATE', 'LOAN_CLOSE',
  'COLLECTION_CREATE', 'COLLECTION_VIEW', 'COLLECTION_UPDATE',
  'REPORT_VIEW'
);

-- FIELD_OFFICER: Customer onboarding, applications, collections
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r, permissions p
WHERE r.role_name = 'FIELD_OFFICER'
AND p.permission_name IN (
  'DASHBOARD_VIEW',
  'CUSTOMER_CREATE', 'CUSTOMER_VIEW', 'CUSTOMER_UPDATE',
  'LOAN_APPLICATION_CREATE', 'LOAN_APPLICATION_VIEW',
  'LOAN_VIEW',
  'COLLECTION_CREATE', 'COLLECTION_VIEW'
);

-- ACCOUNTANT: Financial records and reports
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id FROM roles r, permissions p
WHERE r.role_name = 'ACCOUNTANT'
AND p.permission_name IN (
  'DASHBOARD_VIEW',
  'LOAN_VIEW', 'LOAN_UPDATE',
  'COLLECTION_VIEW', 'COLLECTION_UPDATE',
  'REPORT_VIEW'
);

-- DEFAULT BRANCH
INSERT INTO branches (branch_code, branch_name, address, city, state, pincode, status)
VALUES ('HQ001', 'Head Office', 'New Delhi, India', 'New Delhi', 'Delhi', '110001', 'ACTIVE');

-- COMPANY PROFILE
INSERT INTO company_profile (company_name, registration_number, email, phone, address, city, state, pincode)
VALUES ('PNRG Finance', 'PNRG/2024/001', 'contact@pnrgfinance.com', '+91-11-XXXX-XXXX', 'New Delhi, India', 'New Delhi', 'Delhi', '110001');

-- SYSTEM SETTINGS
INSERT INTO system_settings (id) VALUES (1);