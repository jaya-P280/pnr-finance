import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import PermissionGuard from "./PermissionGuard";
import PublicRoute from "./PublicRoute";

import Login from "../pages/auth/Login";
import PasswordSetup from "../pages/auth/PasswordSetup";
import Register from "../pages/auth/Register";
import BranchList from "../pages/branches/BranchList";
import Collections from "../pages/collections/Collections";
import CustomerDocuments from "../pages/customer-documents/CustomerDocuments";
import ApplyLoan from "../pages/customer-portal/ApplyLoan";
import CustomerDashboard from "../pages/customer-portal/CustomerDashboard";
import EKycVerification from "../pages/customer-portal/EKycVerification";
import LoanApplicationDetail from "../pages/customer-portal/LoanApplicationDetail";
import MyLoanApplications from "../pages/customer-portal/MyLoanApplications";
import MyLoans from "../pages/customer-portal/MyLoans";
import RepaymentSchedule from "../pages/customer-portal/RepaymentSchedule";
import CustomerList from "../pages/customers/CustomersList";
import Dashboard from "../pages/dashboard/Dashboard";
import CashBook from "../pages/finance/CashBook";
import Expenses from "../pages/finance/Expenses";
import Income from "../pages/finance/Income";
import Groups from "../pages/groups/Groups";
import LoanApplications from "../pages/loan-applications/LoanApplications";
import LoanProducts from "../pages/loan-products/LoanProducts";
import Loans from "../pages/loans/Loans";
import Permissions from "../pages/permissions/Permissions";
import Profile from "../pages/profile/Profile";
import CollectionReports from "../pages/reports/CollectionReports";
import CustomerReports from "../pages/reports/CustomerReports";
import LoanReports from "../pages/reports/LoanReports";
import Roles from "../pages/roles/Roles";
import UnifiedSettings from "../pages/settings/UnifiedSettings";
import Tasks from "../pages/tasks/Tasks";
import UsersList from "../pages/users/UsersList";
import AuditLogs from "../pages/audit/AuditLogs";
import Forbidden from "../pages/Forbidden";
import Attendance from "../pages/attendance/Attendance";
import Letters from "../pages/letters/Letters";
import SalaryManagement from "../pages/salary/SalaryManagement";
import Home from "../pages/home/Home";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Home & Landing Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setup-password" element={<PasswordSetup />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/403" element={<Forbidden />} />

          {/* Common / Profile */}
          <Route path="/profile" element={<Profile />} />

          {/* Dashboard */}
          <Route element={<PermissionGuard path="/dashboard" requiredPermission={["DASHBOARD_VIEW"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* User / Administrator Management */}
          <Route element={<PermissionGuard path="/users" requiredPermission={["ADMINISTRATOR_VIEW", "USER_VIEW"]} />}>
            <Route path="/users" element={<UsersList />} />
          </Route>

          {/* Salary Management */}
          <Route element={<PermissionGuard path="/salary" requiredPermission={["USER_VIEW"]} />}>
            <Route path="/salary" element={<SalaryManagement />} />
          </Route>

          {/* Branch Management */}
          <Route element={<PermissionGuard path="/branches" requiredPermission={["BRANCH_VIEW"]} />}>
            <Route path="/branches" element={<BranchList />} />
          </Route>

          {/* Customer Management */}
          <Route element={<PermissionGuard path="/customers" requiredPermission={["CUSTOMER_VIEW"]} />}>
            <Route path="/customers" element={<CustomerList />} />
          </Route>

          {/* Roles & Permissions */}
          <Route element={<PermissionGuard path="/roles" requiredPermission={["ROLE_VIEW"]} />}>
            <Route path="/roles" element={<Roles />} />
          </Route>
          <Route element={<PermissionGuard path="/permissions" requiredPermission={["PERMISSION_VIEW"]} />}>
            <Route path="/permissions" element={<Permissions />} />
          </Route>

          {/* Audit Logs */}
          <Route element={<PermissionGuard path="/audit-logs" requiredPermission={["AUDIT_VIEW"]} />}>
            <Route path="/audit-logs" element={<AuditLogs />} />
          </Route>

          {/* Groups */}
          <Route element={<PermissionGuard path="/groups" requiredPermission={["GROUP_VIEW"]} />}>
            <Route path="/groups" element={<Groups />} />
          </Route>

          {/* Customer eKYC Documents */}
          <Route element={<PermissionGuard path="/customer-documents" requiredPermission={["CUSTOMER_KYC_VIEW"]} />}>
            <Route path="/customer-documents" element={<CustomerDocuments />} />
          </Route>

          {/* Loan Products */}
          <Route element={<PermissionGuard path="/loan-products" requiredPermission={["LOAN_PRODUCT_VIEW"]} />}>
            <Route path="/loan-products" element={<LoanProducts />} />
          </Route>

          {/* Loan Applications */}
          <Route element={<PermissionGuard path="/loan-applications" requiredPermission={["LOAN_APPLICATION_VIEW"]} />}>
            <Route path="/loan-applications" element={<LoanApplications />} />
          </Route>

          {/* Loans */}
          <Route element={<PermissionGuard path="/loans" requiredPermission={["LOAN_VIEW"]} />}>
            <Route path="/loans" element={<Loans />} />
          </Route>

          {/* Collections */}
          <Route element={<PermissionGuard path="/collections" requiredPermission={["COLLECTION_VIEW"]} />}>
            <Route path="/collections" element={<Collections />} />
          </Route>

          {/* Finance */}
          <Route element={<PermissionGuard path="/cashbook" requiredPermission={["CASHBOOK_VIEW"]} />}>
            <Route path="/cash-book" element={<CashBook />} />
            <Route path="/cashbook" element={<CashBook />} />
          </Route>
          <Route element={<PermissionGuard path="/expenses" requiredPermission={["EXPENSE_VIEW"]} />}>
            <Route path="/expenses" element={<Expenses />} />
          </Route>
          <Route element={<PermissionGuard path="/income" requiredPermission={["INCOME_VIEW"]} />}>
            <Route path="/income" element={<Income />} />
          </Route>

          {/* Reports */}
          <Route element={<PermissionGuard path="/loan-reports" requiredPermission={["REPORT_VIEW"]} />}>
            <Route path="/loan-reports" element={<LoanReports />} />
            <Route path="/collection-reports" element={<CollectionReports />} />
            <Route path="/customer-reports" element={<CustomerReports />} />
          </Route>

          {/* Field Tasks */}
          <Route element={<PermissionGuard path="/tasks" requiredPermission={["CUSTOMER_VIEW", "DASHBOARD_VIEW"]} />}>
            <Route path="/tasks" element={<Tasks />} />
          </Route>

          {/* System Settings */}
          <Route element={<PermissionGuard path="/settings" requiredPermission={["SETTINGS_VIEW"]} />}>
            <Route path="/settings" element={<UnifiedSettings />} />
          </Route>

          {/* Attendance Tracking & Biometric/Facial Recognition */}
          <Route element={<PermissionGuard path="/attendance" />}>
            <Route path="/attendance" element={<Attendance />} />
          </Route>

          {/* Employee Letters & Document Generator */}
          <Route element={<PermissionGuard path="/letters" />}>
            <Route path="/letters" element={<Letters />} />
          </Route>

          {/* Customer Portal */}
          <Route element={<PermissionGuard allowedRoles={["CUSTOMER"]} />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/profile" element={<Profile />} />
            <Route path="/customer/settings" element={<UnifiedSettings />} />
            <Route path="/customer/ekyc" element={<EKycVerification />} />
            <Route path="/customer/applications" element={<MyLoanApplications />} />
            <Route path="/customer/applications/:id" element={<LoanApplicationDetail />} />
            <Route path="/customer/apply-loan" element={<ApplyLoan />} />
            <Route path="/customer/loans" element={<MyLoans />} />
            <Route path="/customer/loans/:loanId/schedule" element={<RepaymentSchedule />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
