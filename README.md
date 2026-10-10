# 🏦 PNRG Finance - Comprehensive Microfinance & Loan Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.21-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v6.1-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-v8.0-4479A1?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![MUI](https://img.shields.io/badge/MUI-v6.4-007FFF?style=flat-square&logo=mui)](https://mui.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](LICENSE)

---

## 📌 Overview

**PNRG Finance** is a full-stack, enterprise-grade Microfinance and Loan Management System designed to streamline financial operations, loan origination, repayment tracking, customer management, group lending (SHG), field collection schedules, and automated borrower communications.

Built with a modular monorepo architecture, PNRG Finance couples a modern React frontend (styled with Material UI and Tailwind CSS) with a high-performance Express.js backend backed by a strictly normalized, ACID-compliant MySQL database.

---

## ✨ Key Features

### 🏢 Branch & Role-Based Access Control (RBAC)
- **Multi-Branch Operations**: Manage multiple branches, track branch performance, and scope staff data access.
- **Granular RBAC**: Role-Based Access Control supporting customizable user roles and permissions (`SUPER_ADMIN`, `ADMIN`, `BRANCH_MANAGER`, `FIELD_OFFICER`, `ACCOUNTANT`, `CUSTOMER`).

### 👤 Customer & KYC Management
- **Customer Profiles**: Comprehensive borrower profiles including demographics, employment, monthly income, and addresses.
- **Dedicated KYC Verification**: Aadhaar and PAN verification with status tracking (`PENDING`, `VERIFIED`, `REJECTED`) and verifier audit logs.

### 📄 Customer Portal & Document Management
- **Borrower Self-Service Portal**: Customers can view loan applications, check EMI schedules, track payment receipts, and upload required documents.
- **Signed Loan Agreement & Bank Book Upload**: Download loan agreement terms post-approval, print, sign, and upload along with bank passbook records.
- **Admin Configurable Document Slots**: Administrators can dynamically define, edit, and enforce required document slots (`document_types`).
- **Staff Document Review Dossier**: Reviewers inspect all customer documents in an organized modal showing uploaded vs. pending items, with image/PDF preview and verification actions.

### 💼 Loan Products & Applications
- **Configurable Loan Schemes**: Custom interest rates, tenure ranges, processing fee percentages, penalty rules, and recovery frequencies (Daily, Weekly, Monthly).
- **Application Workflow**: Multi-stage loan processing pipeline (`DRAFT` → `PENDING` → `UNDER_REVIEW` → `VERIFIED` → `APPROVED` → `DISBURSED` / `REJECTED`).

### 📊 Loans & Automated EMI Schedules
- **Active Loan Servicing**: Real-time tracking of active, closed, foreclosed, and defaulted loans.
- **Automated Repayment Schedules**: Precise principal and interest calculations for every installment.
- **Transactions Ledger**: Recording of disbursements, payments, penalty charges, and loan adjustments.

### 💰 Collections & Field Agent Tools
- **Field Recovery & Collections**: Daily and weekly collection logging with receipt generation.
- **Task Management**: Field visit and verification task assignments for Field Officers.

### 🤝 Group Lending (SHG)
- **Self-Help Group (SHG) Support**: Group creation, meeting schedules, group leader/member assignments, and meeting attendance tracking.

### 📈 Financials, Salaries & HR Letters
- **Financial Accounting**: Income and expense tracking categorized by branch with receipt references.
- **Employee Salaries & Payroll**: Base salary, HRA, allowance, and PF deduction calculations with payroll logging.
- **HR Document Issuance**: Generate official offer letters, experience certificates, and official communications.

### 🛡️ Security & Auditing
- **Authentication**: JWT authentication with HTTP-only cookies and access/refresh token rotation.
- **Comprehensive Audit Trail**: High-precision logging of user actions, endpoints, HTTP methods, IP addresses, and response statuses.
- **Security Middleware**: Helmet headers, CORS policies, XSS sanitation, rate limiting, and parameter pollution prevention.

---

## 🗄️ Database Architecture & ACID Standards

The database is designed according to **3rd Normal Form (3NF)** standards with strict **ACID compliance**:

- **Storage Engine**: Every table explicitly runs on `ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC`.
- **Zero Duplicate Columns**:
  - KYC data (Aadhaar, PAN, verification flags) is stored canonically in `customer_kyc(customer_id)`, eliminating duplication in `customers`.
  - Document metadata (`document_type_code`, `document_title`) is normalized into `document_types(id)`, removing duplicate text columns from `customer_documents`.
  - Audit columns (`applied_by`, `verified_by`, `created_by`, `updated_by`, `deleted_by`) are standardized.
- **Referential Integrity**:
  - `ON DELETE RESTRICT` safeguards all financial and ledger data (`loans`, `collections`, `loan_applications`, `loan_products`, `branches`).
  - `ON DELETE CASCADE` is reserved for dependent child entities (`customer_kyc`, `role_permissions`, `repayment_schedules`, `group_members`, `customer_documents`).
  - `ON DELETE SET NULL` for audit/actor tracking fields.
- **Atomic Repository Transactions**: Critical multi-step workflows (loan disbursement, repayment processing, user onboarding) execute within atomic `connection.beginTransaction()` blocks with automated rollback on failure.
- **Clean Default Seeding**: No dummy business data (sample expenses, income, fake loans, fake customers) is seeded. Initialization seeds **only**:
  1. System Roles
  2. Module Permissions & Role-Permission mappings
  3. Default Head Office Branch (`HQ000001`)
  4. Core Demo Staff Accounts
  5. Default Document Upload Slot Types

---

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Core**: React 18, Vite 6
- **UI Components & Styling**: Material UI (MUI v6), Tailwind CSS v4, Emotion
- **State & Data Fetching**: TanStack React Query v5, Axios
- **Form Management**: React Hook Form, Yup, Zod
- **Routing**: React Router v7
- **Data Visualization**: Recharts
- **Notifications**: React Hot Toast

### Backend (`/server`)
- **Runtime & Framework**: Node.js (ES Modules), Express.js
- **Database Engine**: MySQL 8.0+ via `mysql2/promise` (connection pool with InnoDB engine)
- **Authentication**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`)
- **File Uploads**: Multer (with MIME magic-byte validation)
- **Logging & Security**: Winston, Morgan, Helmet, Express Rate Limit, HPP, XSS Clean

---

## 📁 Repository Structure

```text
pnrg-finance/
├── client/                         # Frontend Application (React + Vite + MUI)
│   ├── public/                     # Static public assets
│   ├── src/
│   │   ├── api/                    # API client configuration
│   │   ├── components/             # Reusable UI components & layouts
│   │   ├── context/                # React context providers (AuthContext)
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── layouts/                # Dashboard & Auth layout wrappers
│   │   ├── pages/                  # Views (Loans, EMI, HR, Customer Portal, etc.)
│   │   ├── services/               # Frontend API service layers
│   │   ├── theme/                  # MUI theme customization
│   │   └── utils/                  # Helper utilities
│   ├── package.json
│   └── vite.config.js
│
├── server/                         # Backend Application (Node.js + Express + MySQL)
│   ├── config/                     # Environment & Logger configuration
│   ├── database/                   # MySQL connection pool & DDL initializers
│   │   ├── db.js                   # Connection pool setup
│   │   └── initialize/             # Auto-DDL schema & default configuration seeder
│   ├── middleware/                 # Auth, Audit, Error, and Upload middlewares
│   ├── modules/                    # Domain-driven modular backend architecture
│   │   ├── attendance/             # Employee attendance tracking
│   │   ├── audit/                  # System audit log querying
│   │   ├── auth/                   # Authentication & token rotation
│   │   ├── branches/               # Multi-branch administration
│   │   ├── collections/            # Loan collection & receipt management
│   │   ├── customer-documents/     # Staff review & verification of customer files
│   │   ├── customer-portal/        # Borrower self-service portal & document uploads
│   │   ├── customers/              # Customer onboarding & KYC management
│   │   ├── dashboard/              # Metrics & KPI analytics
│   │   ├── document-slots/         # Dynamic document type slot configuration
│   │   ├── emi/                    # EMI calculation & schedule utilities
│   │   ├── finance/                # Financial cashbook, expenses & income
│   │   ├── groups/                 # Self-Help Group (SHG) microfinance
│   │   ├── health/                 # Server & DB health check endpoints
│   │   ├── letters/                # HR letters & official documents
│   │   ├── loan-applications/      # Loan application pipeline & approvals
│   │   ├── loan-products/          # Loan schemes & policy configuration
│   │   ├── loans/                  # Active loan contracts & repayment tracking
│   │   ├── permissions/            # RBAC permissions management
│   │   ├── reports/                # Financial & operational reporting
│   │   ├── roles/                  # System role administration
│   │   ├── salaries/               # Payroll & compensation management
│   │   ├── settings/               # System settings & company profile
│   │   ├── tasks/                  # Field officer tasks & assignments
│   │   └── users/                  # User accounts & employee records
│   ├── routes/                     # Centralized API route registration
│   ├── shared/                     # Shared helpers (code generators, sanitizers)
│   ├── uploads/                    # Local storage for avatars and documents
│   ├── app.js                      # Express application setup
│   ├── server.js                   # Application entry point
│   └── package.json
│
├── package.json                    # Monorepo workspaces configuration
└── README.md
```

---

## 🔑 Default Demo Accounts

When the server initializes, the following staff accounts are automatically prepared:

| Role | Email | Password | Employee Code |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@pnrgfinance.com` | `SuperAdmin@123` | `SUP000001` |
| **Admin** | `admin@pnrgfinance.com` | `Admin@123` | `EMP000001` |
| **Branch Manager** | `bm@pnrgfinance.com` | `Manager@123` | `EMP000002` |
| **Field Officer** | `fo@pnrgfinance.com` | `Officer@123` | `EMP000003` |
| **Accountant** | `accountant@pnrgfinance.com` | `Accountant@123` | `EMP000004` |

---

## ⚙️ Getting Started

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MySQL**: `v8.0` or higher (local or cloud instance)

### 2. Clone & Install

```bash
git clone https://github.com/jaya-P280/pnr-finance.git
cd pnrg-finance
npm install
```

### 3. Environment Configuration

#### Server (`server/.env`)
```env
MODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pnrg_finance
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Authentication
JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Logging & App URL
LOG_LEVEL=info
APP_URL=http://localhost:5000
```

#### Client (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=PNRG Finance
VITE_APP_URL=http://localhost:5000
```

### 4. Running the Application

```bash
# Run both Client and Server concurrently
npm run dev

# Or run separately
npm run dev:server    # Server only (http://localhost:5000)
npm run dev:client    # Client only (http://localhost:5173)
```

---

## 🔌 API Routes Reference

All backend endpoints are prefixed with `/api/v1`.

| Module | Base Path | Description |
| :--- | :--- | :--- |
| **Auth** | `/api/v1/auth` | Login, refresh token, logout, profile |
| **Users** | `/api/v1/users` | Staff employee records and user accounts |
| **Roles & Permissions** | `/api/v1/roles`, `/api/v1/permissions` | RBAC role definitions and permission matrix |
| **Branches** | `/api/v1/branches` | Branch CRUD and assignment |
| **Customers** | `/api/v1/customers` | Customer onboarding and KYC verification |
| **Customer Portal** | `/api/v1/customer` | Borrower dashboard, loan views, document uploads |
| **Customer Documents** | `/api/v1/customer-documents` | Staff review, verification, and rejection of uploaded files |
| **Document Slots** | `/api/v1/document-slots` | Admin configuration for dynamic document types |
| **Loan Products** | `/api/v1/loan-products` | Loan schemes, interest rates, and fee structures |
| **Loan Applications** | `/api/v1/loan-application` | Loan application submission and approval pipeline |
| **Loans** | `/api/v1/loans` | Active loan disbursement, closure, foreclosure |
| **EMI** | `/api/v1/emi` | Repayment schedule calculations and status |
| **Collections** | `/api/v1/collections` | Field collection logging and payment receipts |
| **Groups** | `/api/v1/groups` | SHG group microfinance and meetings |
| **Finance** | `/api/v1/finance` | Income and expense cashbook ledger |
| **Attendance & Salaries**| `/api/v1/attendance`, `/api/v1/salaries` | Staff attendance and monthly payroll |
| **Letters** | `/api/v1/letters` | Official HR and offer letters |
| **Tasks** | `/api/v1/tasks` | Field officer task assignments |
| **Settings** | `/api/v1/settings` | System-wide settings and company profile |
| **Audit Logs** | `/api/v1/audit-logs` | Security and audit trail logs |
| **Health** | `/api/v1/health` | System and database health checks |

---

## 👤 Author

- **Palem Jaya Prakash Goud** ([@jaya-P280](https://github.com/jaya-P280))

---

## 📄 License

This project is licensed under the **ISC License**.
