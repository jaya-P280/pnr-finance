# PNRG Finance

Production-grade Microfinance Loan Management System built with React, Node.js, Express and MySQL.

## Tech Stack

- **Frontend:** React 19, React Router, MUI, TanStack Query, Tailwind CSS, React Hook Form, Zod/Yup
- **Backend:** Node.js, Express 5, MySQL (mysql2)
- **Auth/Security:** JWT (access + refresh), bcrypt, RBAC, Helmet, CORS, rate limiting, XSS protection

## Architecture

- Modular, feature-based structure (`modules/<feature>` on the server)
- REST API
- JWT authentication with refresh tokens
- Role-Based Access Control (RBAC)

---

## Features Implemented So Far

### Authentication & Security
- Login with rate limiting (`loginLimiter`)
- Access/refresh token issuing and refresh flow
- Logout
- Get current authenticated user profile (`/auth/me`)
- Password reset/setup via emailed token (verify token + set password)
- RBAC authorization middleware (`authorize`, `rbac.middleware`)
- Centralized error handling, 404 handling, request validation middleware
- Audit logging module (repository/service layer)

### User Management (Super Admin)
- Create, list, get by ID, update, delete users
- Update user status (active/inactive)
- Upload/update user profile image

### Role Management
- List active roles

### Branch Management
- Create, list, get by ID, update, delete branches
- Update branch status
- Protected by `MANAGE_BRANCH` permission

### Customer Management
- Create, list, get by ID, update, delete customers
- Update customer status
- Protected by `CUSTOMER_CREATE` / `CUSTOMER_UPDATE` / `CUSTOMER_DELETE` permissions

### System
- Health check endpoint
- Email service (Nodemailer) with templated emails (e.g. password setup)
- File upload handling (Multer)

### Frontend
- Public/Protected route separation with a shared dashboard layout
- Sidebar navigation with grouped sections (Dashboard, Master, Loans, Finance, Reports, System)
- Auth context + `useAuth` hook, Axios instance with interceptors for token handling
- Dashboard, Users, Branches, Customers, Roles, Profile screens wired to the live API

---

## Routers

### Backend — API Routes (`server/src/routes/index.js`)

All routes are mounted under the base API path.

| Base Path | Module | Routes |
|---|---|---|
| `/health` | Health | `GET /` — service health check |
| `/auth` | Auth | `POST /login`, `POST /refresh`, `POST /logout`, `GET /me` (auth required) |
| `/password` | Password Reset | `GET /:token` — verify reset token, `POST /` — set new password |
| `/users` | Users | `POST /`, `GET /`, `GET /:id`, `PUT /:id`, `PATCH /:id/status`, `DELETE /:id`, `PATCH /:id/profile-image` — all require auth; most require `SUPER_ADMIN` |
| `/branches` | Branches | `POST /`, `GET /`, `GET /:id`, `PUT /:id`, `PATCH /:id/status`, `DELETE /:id` — write ops require `MANAGE_BRANCH` |
| `/customers` | Customers | `POST /`, `GET /`, `GET /:id`, `PUT /:id`, `PATCH /:id/status`, `DELETE /:id` — write ops require `CUSTOMER_CREATE`/`CUSTOMER_UPDATE`/`CUSTOMER_DELETE` |
| `/roles` | Roles | `GET /` — list active roles (auth required) |

### Frontend — App Routes (`client/src/routes/AppRoutes.jsx`)

**Public (unauthenticated only):**
| Path | Page |
|---|---|
| `/login` | Login |
| `/setup-password` | Password Setup |

**Protected (inside Dashboard layout):**
| Path | Page | Status |
|---|---|---|
| `/dashboard` | Dashboard | Live |
| `/users` | Users List | Live |
| `/branches` | Branch List | Live |
| `/customers` | Customers List | Live |
| `/profile` | Profile | Live |
| `/roles` | Roles | Live |
| `/permissions` | Permissions | UI built, backend pending |
| `/groups` | Groups | UI built, backend pending |
| `/customer-documents` | Customer Documents | Placeholder — awaiting backend |
| `/loan-products` | Loan Products | UI built, backend pending |
| `/loan-applications` | Loan Applications | UI built, backend pending |
| `/loans` | Loans | UI built, backend pending |
| `/collections` | Collections | UI built, backend pending |
| `/cash-book` | Cash Book | Placeholder — awaiting backend |
| `/expenses` | Expenses | Placeholder — awaiting backend |
| `/income` | Income | Placeholder — awaiting backend |
| `/loan-reports` | Loan Reports | UI built, backend pending |
| `/collection-reports` | Collection Reports | UI built, backend pending |
| `/customer-reports` | Customer Reports | UI built, backend pending |
| `/settings` | Settings | UI built, backend pending |

Unmatched paths redirect to `/dashboard`.

---

## In Progress

The following modules have frontend screens already scaffolded but are not yet wired to a backend module: Loan Products, Loan Applications, Loans, Collections, Groups, Permissions, Reports (Loan/Collection/Customer), Settings, Customer Documents, and Finance (Cash Book/Expenses/Income).

---

## Project Structure

```
pnr-finance/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── api/         # Axios API calls per module
│       ├── pages/        # Route-level pages
│       ├── routes/       # AppRoutes, ProtectedRoute, PublicRoute
│       ├── components/   # Layout + shared components
│       └── context/       # Auth context
├── server/          # Express backend
│   └── src/
│       ├── modules/      # Feature modules (auth, users, branches, customers, roles, health, audit)
│       ├── middleware/    # Auth, RBAC, validation, error handling
│       ├── routes/        # Central router
│       └── database/       # DB connection + initialization/seed
└── database/
    └── migrations/    # SQL migrations
```

## Environment Variables (server)

See `server/.env.example`:

```
MODE_ENV, PORT, HOST
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES, JWT_REFRESH_EXPIRES
LOG_LEVEL
```

## Getting Started

```bash
# Server
cd server
npm install
cp .env.example .env   # fill in real values
npm run db:migrate
npm run db:seed
npm run dev

# Client
cd client
npm install
npm run dev
```