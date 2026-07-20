import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";

import Login from "../pages/auth/Login";
import PasswordSetup from "../pages/auth/PasswordSetup";
import Dashboard from "../pages/dashboard/Dashboard";
import UsersList from "../pages/users/UsersList";
import BranchList from "../pages/branches/BranchList";
import CustomerList from "../pages/customers/CustomersList";
import Profile from "../pages/profile/Profile";
import Roles from "../pages/roles/Roles";
import Permissions from "../pages/permissions/Permissions";
import Groups from "../pages/groups/Groups";
import CustomerDocuments from "../pages/customer-documents/CustomerDocuments";
import LoanProducts from "../pages/loan-products/LoanProducts";
import LoanApplications from "../pages/loan-applications/LoanApplications";
import Loans from "../pages/loans/Loans";
import Collections from "../pages/collections/Collections";
import CashBook from "../pages/finance/CashBook";
import Expenses from "../pages/finance/Expenses";
import Income from "../pages/finance/Income";
import LoanReports from "../pages/reports/LoanReports";
import CollectionReports from "../pages/reports/CollectionReports";
import CustomerReports from "../pages/reports/CustomerReports";
import Settings from "../pages/settings/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/setup-password" element={<PasswordSetup />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/branches" element={<BranchList />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/customer-documents" element={<CustomerDocuments />} />
          <Route path="/loan-products" element={<LoanProducts />} />
          <Route path="/loan-applications" element={<LoanApplications />} />
          <Route path="/loans" element={<Loans />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/cash-book" element={<CashBook />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/income" element={<Income />} />
          <Route path="/loan-reports" element={<LoanReports />} />
          <Route path="/collection-reports" element={<CollectionReports />} />
          <Route path="/customer-reports" element={<CustomerReports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
