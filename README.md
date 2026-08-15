# 🏦 PNRG Finance - Comprehensive Microfinance & Loan Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.21-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-v18.3-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v6.1-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-v8.0-4479A1?style=flat-square&logo=mysql)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![MUI](https://img.shields.io/badge/MUI-v6.4-007FFF?style=flat-square&logo=mui)](https://mui.com/)
[![SMS Gateway](https://img.shields.io/badge/SMS-Fast2SMS-FF6B6B?style=flat-square)](https://www.fast2sms.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](LICENSE)

---

## 📌 Overview

**PNRG Finance** is a full-stack, enterprise-grade Microfinance and Loan Management System designed to streamline financial operations, loan origination, repayment tracking, customer management, group lending (SHG), field collection schedules, and automated SMS notifications. 

Built with a modular monorepo architecture, PNRG Finance couples a modern React frontend (styled with MUI and Tailwind CSS) with a high-performance Express.js backend powered by MySQL.

---

## ✨ Key Features

### 🏢 Branch & Access Control
- **Multi-Branch Operations**: Manage multiple branches, assign staff, and track location-specific performance.
- **Granular RBAC**: Role-Based Access Control supporting customizable user roles and permissions (Admin, Branch Manager, Field Agent, Accountant).

### 👤 Customer & KYC Management
- **Customer Profiles**: Comprehensive borrower profiles including personal details, employment, and income details.
- **KYC & Document Verification**: Upload and verify identity, address, and income documents.

### 💼 Loan Products & Applications
- **Configurable Loan Products**: Custom interest rates, tenure options, processing fees, and repayment schedules (Daily, Weekly, Monthly).
- **Application Workflow**: Multi-stage loan application processing, credit checks, and approval/rejection workflows.

### 📊 Loans & EMI Tracking
- **Active Loan Management**: Real-time tracking of active, closed, and defaulted loans.
- **Automated EMI Calculation**: Precise interest and principal repayment breakdown schedules.
- **Repayment Ledger**: Instant recording of EMI payments, receipts generation, and overdue penalty tracking.

### 🤝 Group & Microfinance Lending (SHG)
- **Self-Help Group (SHG) Support**: Group creation, joint liability group loans, and group repayment collection tracking.

### 📱 SMS Notifications & Reminders
- **Automated Customer SMS**: Send EMI due date reminders, payment confirmation alerts, and loan status updates via Fast2SMS gateway.
- **Sandbox Mode**: Built-in simulation mode for development and testing environments when API keys are not active.

### 💰 Collections & Field Management
- **Daily / Weekly Collections**: Collection sheet generation for field agents.
- **Agent Performance**: Tracking collection efficiency and agent assignments.

### 📈 Financials, Payroll & HR
- **Financial Accounting**: Expense tracking, revenue logging, and financial health dashboards.
- **Attendance & Payroll**: Employee attendance logging and salary distribution management.

### 📜 Borrower Self-Service Portal
- **Customer Portal**: Dedicated borrower portal for customers to check active loans, inspect EMI repayment schedules, view payment history, and manage profiles.
- **Document Generation**: Automatic generation of loan sanction letters, agreement docs, and collection notice letters.
- **Reports & Analytics**: Visual charts and exports (using Recharts) for business reporting.

### 🛡️ Security & Auditing
- **Authentication**: JWT authentication using HTTP-only cookies and access/refresh token rotation.
- **Audit Logging**: Comprehensive system audit trail capturing user actions and administrative changes.
- **Security Middleware**: Protected against XSS, HPP, parameter pollution, rate limiting, and CORS restrictions.

---

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Core**: React 18, Vite 6
- **UI Components & Styling**: Material UI (MUI v6), Tailwind CSS v4, Emotion
- **State & Data Fetching**: TanStack React Query v5, Axios
- **Form Management**: React Hook Form, Yup, Zod validation
- **Routing**: React Router v7
- **Data Visualization**: Recharts
- **Notifications**: React Hot Toast

### Backend (`/server`)
- **Runtime & Framework**: Node.js (ES Modules), Express.js
- **Database**: MySQL 8.0+ via `mysql2/promise` (connection pooling with query fallbacks)
- **Authentication**: JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`)
- **Notifications & SMS**: Fast2SMS API (`axios`) with developer sandbox fallback
- **File Uploads**: Multer
- **Mailing**: Nodemailer
- **Logging & Security**: Winston, Morgan, Helmet, Express Rate Limit, HPP, XSS Clean

---

## 📁 Repository Structure

```text
pnrg-finance/
├── client/                     # Frontend Application (React + Vite + MUI)
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── api/                # API client & endpoints setup
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # React context providers (AuthContext)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Dashboard & Auth layout wrappers
│   │   ├── pages/              # Application views/routes (Loans, EMI, HR, Customer Portal, etc.)
│   │   ├── services/           # Service abstractions
│   │   ├── theme/              # MUI theme configuration
│   │   └── utils/              # Helper utilities
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Application (Node.js + Express + MySQL)
│   ├── config/                 # Environment & Logger configuration
│   ├── database/               # MySQL pool setup & schema initializers
│   ├── middleware/             # Auth, Audit, Error, and Validation middlewares
│   ├── modules/                # Feature-based business logic modules
│   │   ├── attendance/
│   │   ├── audit/
│   │   ├── auth/
│   │   ├── branches/
│   │   ├── collections/
│   │   ├── customer-portal/
│   │   ├── customers/
│   │   ├── dashboard/
│   │   ├── emi/
│   │   ├── finance/
│   │   ├── groups/
│   │   ├── loan-applications/
│   │   ├── loan-products/
│   │   ├── loans/
│   │   ├── reports/
│   │   ├── salaries/
│   │   └── users/
│   ├── shared/                 # Shared backend services (SMS service, etc.)
│   ├── routes/                 # Express API routes
│   ├── uploads/                # File upload destination directory
│   ├── app.js                  # Express app initialization
│   ├── server.js               # Entry point (DB connection & HTTP server)
│   └── package.json
│
├── package.json                # Root package.json (npm workspaces configuration)
└── README.md
```

---

## ⚙️ Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MySQL Database**: `v8.0` or higher (local instance or cloud like Aiven, AWS RDS)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/jaya-P280/pnr-finance.git
cd pnrg-finance
```

### 2. Install Dependencies

Install root, client, and server dependencies in one command using npm workspaces:

```bash
npm install
```

### 3. Environment Variables Setup

#### Server Configuration (`/server/.env`)

Create a `.env` file inside the `server/` directory:

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

# JWT Configuration
JWT_ACCESS_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# SMS Configuration (Fast2SMS / Gateway)
SMS_API_KEY=your_fast2sms_api_key

# Logging & Mail
LOG_LEVEL=info
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_email_app_password
MAIL_FROM=noreply@pnrfinance.com

APP_URL=http://localhost:5000
```

#### Client Configuration (`/client/.env`)

Create a `.env` file inside the `client/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_APP_NAME=PNRG Finance
VITE_APP_URL=http://localhost:5000
```

### 4. Database Setup

Ensure your MySQL server is running and the target database exists (or will be initialized automatically on server boot).

### 5. Running the Application

#### Development Mode (Client + Server concurrently)

```bash
npm run dev
```
- Client runs at: `http://localhost:5173`
- Server API runs at: `http://localhost:5000`

#### Run Client or Server Independently

```bash
# Run Server only
npm run dev:server

# Run Client only
npm run dev:client
```

---

## 📜 NPM Scripts Summary

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs both client (Vite dev server) and server concurrently |
| `npm run dev:client` | Runs the Vite client development server |
| `npm run dev:server` | Runs the Node.js server (`server/server.js`) |
| `npm run build` | Builds the React frontend application for production |
| `npm run start` | Builds the client and starts the production Node.js server |
| `npm run lint` | Runs ESLint checks on client codebase |

---

## 🔌 API Routes Overview

All backend endpoints are prefixed with `/api/v1`.

| Module | Base Path | Description |
| :--- | :--- | :--- |
| **Auth** | `/api/v1/auth` | User & customer login, refresh token, logout, profile |
| **Users & Roles** | `/api/v1/users`, `/api/v1/roles` | User accounts and role permission assignments |
| **Branches** | `/api/v1/branches` | Branch CRUD and assignment |
| **Customers** | `/api/v1/customers` | Customer onboarding, KYC documents |
| **Loan Products** | `/api/v1/loan-products` | Management of loan products & rules |
| **Loan Applications** | `/api/v1/loan-applications` | Application submissions & approval workflow |
| **Loans** | `/api/v1/loans` | Active loan disbursement & monitoring |
| **EMI** | `/api/v1/emi` | EMI calculation, payment collection & receipts |
| **Collections** | `/api/v1/collections` | Field collection schedule & recovery |
| **Groups** | `/api/v1/groups` | SHG / Group loan management |
| **Finance** | `/api/v1/finance` | Financial ledger & expense tracking |
| **Attendance & Payroll** | `/api/v1/attendance`, `/api/v1/salaries` | Staff attendance and salary processing |
| **Customer Portal** | `/api/v1/customer-portal` | Borrower dashboard & personal loan view |
| **Reports & Audit** | `/api/v1/reports`, `/api/v1/audit` | System reporting and audit activity logs |

---

## 👤 Author

- **Palem Jaya Prakash Goud** ([@jaya-P280](https://github.com/jaya-P280))

---

## 📄 License

This project is licensed under the **ISC License**.
