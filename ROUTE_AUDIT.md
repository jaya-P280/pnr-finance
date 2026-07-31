# Backend Route Audit & Frontend API Mapping

## Server Routes Summary

All routes are prefixed with `/api/v1`

### 1. Health Routes (`/api/v1/health`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| GET | `/health` | No | None | Server health status |

---

### 2. Auth Routes (`/api/v1/auth`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| POST | `/auth/login` | No | None | User data, tokens (accessToken, refreshToken) |
| POST | `/auth/register` | No | None | New user created |
| POST | `/auth/refresh` | No | None | New access and refresh tokens |
| POST | `/auth/logout` | No | None | Success message |
| GET | `/auth/me` | Yes | None | Current user profile |

---

### 3. User Routes (`/api/v1/users`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| POST | `/users` | Yes | USER_CREATE | Created user object |
| GET | `/users` | Yes | USER_VIEW | Paginated list of users |
| GET | `/users/:id` | Yes | USER_VIEW | User details by ID |
| PUT | `/users/:id` | Yes | USER_UPDATE | Updated user object |
| PATCH | `/users/:id/status` | Yes | USER_UPDATE | Updated user status |
| DELETE | `/users/:id` | Yes | USER_DELETE | Delete confirmation |

**Missing:** `PATCH /users/:id/profile-image` endpoint (referenced in frontend but not in backend routes)

---

### 4. Branch Routes (`/api/v1/branches`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| POST | `/branches` | Yes | MANAGE_BRANCH | Created branch object |
| GET | `/branches` | Yes | None | List of all branches |
| GET | `/branches/:id` | Yes | None | Branch details by ID |
| PUT | `/branches/:id` | Yes | MANAGE_BRANCH | Updated branch object |
| PATCH | `/branches/:id/status` | Yes | MANAGE_BRANCH | Updated branch status |
| DELETE | `/branches/:id` | Yes | MANAGE_BRANCH | Delete confirmation |

---

### 5. Customer Routes (`/api/v1/customers`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| POST | `/customers` | Yes | CUSTOMER_CREATE | Created customer object |
| GET | `/customers` | Yes | None | Paginated list of customers |
| GET | `/customers/:id` | Yes | None | Customer details by ID |
| PUT | `/customers/:id` | Yes | CUSTOMER_UPDATE | Updated customer object |
| PATCH | `/customers/:id/status` | Yes | CUSTOMER_UPDATE | Updated customer status |
| DELETE | `/customers/:id` | Yes | CUSTOMER_DELETE | Delete confirmation |
| POST | `/customers/:id/kyc` | Yes | CUSTOMER_UPDATE | KYC upload confirmation |
| PATCH | `/customers/:id/kyc/verify` | Yes | CUSTOMER_VERIFY | KYC verification result |
| PATCH | `/customers/:id/kyc/reject` | Yes | CUSTOMER_VERIFY | KYC rejection result |
| POST | `/customers/:id/family` | Yes | CUSTOMER_UPDATE | Added family member |
| GET | `/customers/:id/family` | Yes | None | List of family members |
| PUT | `/customers/family/:familyId` | Yes | CUSTOMER_UPDATE | Updated family member |
| DELETE | `/customers/family/:familyId` | Yes | CUSTOMER_UPDATE | Delete confirmation |
| POST | `/customers/:id/nominees` | Yes | CUSTOMER_UPDATE | Added nominee |
| GET | `/customers/:id/nominees` | Yes | None | List of nominees |
| PUT | `/customers/nominees/:nomineeId` | Yes | CUSTOMER_UPDATE | Updated nominee |
| DELETE | `/customers/nominees/:nomineeId` | Yes | CUSTOMER_UPDATE | Delete confirmation |
| GET | `/customers/:id/profile` | Yes | None | Complete customer profile |
| GET | `/customers/kyc/queue` | Yes | CUSTOMER_VERIFY | List of pending KYC verifications |

**Missing Customer Portal Endpoints:**
- `GET /customer/profile` - Get logged-in customer's profile
- `PUT /customer/profile` - Update logged-in customer's profile
- `GET /loans/my-applications` - Get customer's loan applications
- `POST /loans/application` - Create loan application (already exists as `/loan-application`)
- `GET /loans/application/:id` - Get application details (exists)
- `PATCH /loans/application/:id/withdraw` - Withdraw application
- `GET /loans/my-active-loans` - Get customer's active loans
- `GET /loans/:id/schedule` - Get repayment schedule
- `GET /loans/:id/disbursement` - Get disbursement details
- All eKYC endpoints (`/ekyc/*`)

---

### 6. Role Routes (`/api/v1/roles`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| GET | `/roles` | Yes | ROLE_VIEW | List of all roles |
| GET | `/roles/:id` | Yes | ROLE_VIEW | Role details by ID |
| POST | `/roles` | Yes | ROLE_CREATE | Created role object |
| PUT | `/roles/:id` | Yes | ROLE_UPDATE | Updated role object |
| PATCH | `/roles/:id/status` | Yes | ROLE_UPDATE | Updated role status |
| GET | `/roles/:id/permissions` | Yes | ROLE_VIEW | List of role permissions |
| PUT | `/roles/:id/permissions` | Yes | ROLE_UPDATE | Updated permissions |
| DELETE | `/roles/:id` | Yes | ROLE_DELETE | Delete confirmation |

**Missing:** `GET /roles/:id/permission-tree` endpoint (referenced in frontend)

---

### 7. Permission Routes (`/api/v1/permissions`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| GET | `/permissions` | Yes | PERMISSION_VIEW | List of all permissions |
| GET | `/permissions/modules` | Yes | PERMISSION_VIEW | List of permission modules |
| GET | `/permissions/grouped` | Yes | PERMISSION_VIEW | Permissions grouped by module |
| GET | `/permissions/:id` | Yes | PERMISSION_VIEW | Permission details by ID |

---

### 8. Loan Product Routes (`/api/v1/loan-products`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| POST | `/loan-products` | Yes | LOAN_PRODUCT_CREATE | Created loan product |
| GET | `/loan-products` | Yes | LOAN_PRODUCT_VIEW | Paginated list of loan products |
| GET | `/loan-products/:id` | Yes | LOAN_PRODUCT_VIEW | Loan product details |
| PUT | `/loan-products/:id` | Yes | LOAN_PRODUCT_UPDATE | Updated loan product |
| PATCH | `/loan-products/:id/status` | Yes | LOAN_PRODUCT_UPDATE | Updated status |
| DELETE | `/loan-products/:id` | Yes | LOAN_PRODUCT_DELETE | Delete confirmation |

---

### 9. Loan Application Routes (`/api/v1/loan-application`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| POST | `/loan-application` | Yes | LOAN_APPLICATION_CREATE | Created loan application |
| GET | `/loan-application` | Yes | LOAN_APPLICATION_VIEW | Paginated list of applications |
| GET | `/loan-application/:id` | Yes | LOAN_APPLICATION_VIEW | Application details |
| PUT | `/loan-application/:id` | Yes | LOAN_APPLICATION_UPDATE | Updated application |
| PATCH | `/loan-application/:id/status` | Yes | LOAN_APPLICATION_UPDATE | Updated status |
| PATCH | `/loan-application/:id/verify` | Yes | LOAN_APPLICATION_VERIFY | Verification result |
| PATCH | `/loan-application/:id/approve` | Yes | LOAN_APPLICATION_APPROVE | Approval result |
| PATCH | `/loan-application/:id/reject` | Yes | LOAN_APPLICATION_APPROVE | Rejection result |
| PATCH | `/loan-application/:id/disburse` | Yes | LOAN_APPLICATION_DISBURSE | Disbursement result |
| DELETE | `/loan-application/:id` | Yes | LOAN_APPLICATION_DELETE | Delete confirmation |

---

### 10. Loan Routes (`/api/v1/loans`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| POST | `/loans` | Yes | LOAN_CREATE | Created loan |
| GET | `/loans` | Yes | LOAN_VIEW | Paginated list of loans |
| GET | `/loans/:id` | Yes | LOAN_VIEW | Loan details |
| PUT | `/loans/:id` | Yes | LOAN_UPDATE | Updated loan |
| PATCH | `/loans/:id/status` | Yes | LOAN_UPDATE | Updated status |
| PATCH | `/loans/:id/close` | Yes | LOAN_CLOSE | Loan closure result |
| PATCH | `/loans/:id/foreclose` | Yes | LOAN_FORECLOSE | Foreclosure result |
| PATCH | `/loans/:id/default` | Yes | LOAN_DEFAULT | Default marking result |
| POST | `/loans/apply` | Yes | LOAN_APPLICATION_CREATE | Customer loan application |

---

### 11. Group Routes (`/api/v1/groups`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| POST | `/groups` | Yes | GROUP_CREATE | Created group |
| GET | `/groups` | Yes | GROUP_VIEW | Paginated list of groups |
| GET | `/groups/:id` | Yes | GROUP_VIEW | Group details |
| PUT | `/groups/:id` | Yes | GROUP_UPDATE | Updated group |
| DELETE | `/groups/:id` | Yes | GROUP_DELETE | Delete confirmation |
| POST | `/groups/:id/members` | Yes | GROUP_UPDATE | Added member |
| DELETE | `/groups/:id/members/:customerId` | Yes | GROUP_UPDATE | Removed member |
| POST | `/groups/:id/attendance` | Yes | GROUP_UPDATE | Attendance recorded |
| GET | `/groups/:id/attendance` | Yes | GROUP_VIEW | Attendance records |

---

### 12. Collection Routes (`/api/v1/collections`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| POST | `/collections` | Yes | COLLECTION_CREATE | Created collection |
| GET | `/collections` | Yes | COLLECTION_VIEW | Paginated list of collections |
| GET | `/collections/summary` | Yes | COLLECTION_VIEW | Collection summary stats |
| GET | `/collections/:id` | Yes | COLLECTION_VIEW | Collection details |
| PUT | `/collections/:id` | Yes | COLLECTION_UPDATE | Updated collection |
| DELETE | `/collections/:id` | Yes | COLLECTION_DELETE | Delete confirmation |

---

### 13. Settings Routes (`/api/v1/settings`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| GET | `/settings/company` | Yes (Admin Only) | SETTINGS_VIEW | Company profile |
| PUT | `/settings/company` | Yes (Admin Only) | SETTINGS_UPDATE | Updated company profile |
| GET | `/settings/system` | Yes (Admin Only) | SETTINGS_VIEW | System settings |
| PUT | `/settings/system` | Yes (Admin Only) | SETTINGS_UPDATE | Updated system settings |

**Note:** All settings routes require `adminOnly` middleware

---

### 14. Dashboard Routes (`/api/v1/dashboard`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| GET | `/dashboard/stats` | Yes | None | Dashboard statistics (loans, collections, customers, etc.) |

---

### 15. Report Routes (`/api/v1/reports`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| GET | `/reports/loans` | Yes | REPORT_VIEW | Loan report data |
| GET | `/reports/collections` | Yes | REPORT_VIEW | Collection report data |
| GET | `/reports/customers` | Yes | REPORT_VIEW | Customer report data |
| GET | `/reports/recovery` | Yes | REPORT_VIEW | Recovery report data |

---

### 16. EMI Routes (`/api/v1/emi`)
| Method | Endpoint | Auth | Authorization | Returns |
|--------|----------|------|---------------|---------|
| POST | `/emi/calculate` | Yes | None | EMI calculation result (emi, totalPayment, totalInterest, schedule) |

---

## Frontend API Issues Found

### 1. **customer.api.js - Customer Portal API**
**Problem:** Frontend defines these endpoints but they DON'T EXIST on backend:
```javascript
// ❌ MISSING BACKEND ROUTES
getMyProfile: () => api.get('/customer/profile'),
updateMyProfile: (data) => api.put('/customer/profile', data),
getMyApplications: () => api.get('/loans/my-applications'),
createApplication: (data) => api.post('/loans/application', data),
getApplicationDetails: (id) => api.get(`/loans/application/${id}`),
withdrawApplication: (id) => api.patch(`/loans/application/${id}/withdraw`),
getMyActiveLoans: () => api.get('/loans/my-active-loans'),
getRepaymentSchedule: (loanId) => api.get(`/loans/${loanId}/schedule`),
getDisbursementDetails: (loanId) => api.get(`/loans/${loanId}/disbursement`),

// ❌ ALL eKYC endpoints don't exist
initiateDigilocker: () => api.post('/ekyc/digilocker/initiate'),
checkDigilockerStatus: (transactionId) => api.get(`/ekyc/digilocker/status/${transactionId}`),
verifyPan: (panNumber) => api.post('/ekyc/pan/verify', { panNumber }),
getKycStatus: () => api.get('/ekyc/status'),
uploadAadhaar: (formData) => api.post('/ekyc/aadhaar/upload', formData),
uploadPan: (formData) => api.post('/ekyc/pan/upload', formData),
```

### 2. **role.api.js**
**Problem:** Frontend calls `GET /roles/:id/permission-tree` but backend only has `GET /roles/:id/permissions`
```javascript
// ❌ INCORRECT
export const getPermissionTree = (id) => api.get(`${ENDPOINTS.ROLES}/${id}/permission-tree`);

// ✅ SHOULD BE
export const getRolePermissions = (id) => api.get(`${ENDPOINTS.ROLES}/${id}/permissions`);
```

### 3. **user.api.js**
**Problem:** Frontend has `uploadProfileImage` but backend doesn't have this route
```javascript
// ❌ MISSING BACKEND ROUTE
export const uploadProfileImage = (id, file) => {
  const formData = new FormData();
  formData.append("profileImage", file);
  return api.patch(`${ENDPOINTS.USERS}/${id}/profile-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
```

---

## Menu Structure Issues

### Current Problems:
1. **Company Settings shown to all users** - Should be admin-only
2. **Settings and Company Settings are separate** - Should have one unified "Settings" page with tabs
3. **SUPER_ADMIN has limited access** - Should have full system access
4. **Customer portal menu properly structured** ✅

### Proposed Menu Structure:

#### Admin/Staff Portal:
- **Dashboard** - Overview stats
- **Master**
  - User Management (Users, Roles, Permissions)
  - Organization (Branches, Groups)
  - Customer (Customers, eKYC)
- **Loans** - Loan Products, Applications, Loans, Collections
- **Finance** - Cash Book, Expenses, Income
- **Reports** - Loan, Collection, Customer Reports
- **My Account**
  - My Profile
  - Settings (User preferences, password change)
  - Company Settings (Admin only - company profile, system config)

#### Customer Portal:
- **Overview** - Dashboard
- **My Account** - Profile, e-KYC Status, Settings
- **Loans** - My Applications, Apply for Loan, Active Loans

---

## Recommendations

### Backend Changes Needed:
1. **Add Customer Portal Routes** - Create routes for customer self-service
2. **Add User Profile Image Upload** - Implement the missing route
3. **Create Loan Schedule/Disbursement Endpoints** - Add endpoints for repayment schedules
4. **Implement eKYC Routes** (Optional) - If eKYC integration is planned
5. **Add Withdraw Application Endpoint** - Allow customers to withdraw applications

### Frontend Changes Needed:
1. **Fix role.api.js** - Remove `getPermissionTree` or map it to correct endpoint
2. **Update customer.api.js** - Remove non-existent endpoints or implement them on backend
3. **Restructure Settings** - Merge settings pages with proper role-based access
4. **Update Menu Configuration** - Apply new menu structure with proper role filtering

### Settings Page Structure:
```
/settings (All users)
├── My Profile (name, email, phone)
├── Change Password
└── Preferences (theme, notifications)

/settings/company (Admin only)
├── Company Profile (name, logo, address)
└── System Configuration (date format, currency, etc.)
```
