import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { ROLE_ACCESS } from "../components/constants/menu";

export default function PermissionGuard({ requiredPermission, allowedRoles, path }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role_name || user.role || "").toUpperCase().trim().replace(/\s+/g, "_");
  const targetPath = path || location.pathname;

  // 1. Role Access Path Protection (Checks if current route is allowed in role's menu specification)
  const allowedPaths = ROLE_ACCESS[role];
  if (allowedPaths && Array.isArray(allowedPaths) && targetPath !== "/dashboard" && targetPath !== "/profile" && targetPath !== "/403") {
    const isAllowed = allowedPaths.some(
      (p) => targetPath === p || targetPath.startsWith(p + "/")
    );
    if (!isAllowed) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 2. Check Explicit Allowed Roles list if provided
  if (allowedRoles && allowedRoles.length > 0) {
    const normAllowedRoles = allowedRoles.map((r) =>
      r.toUpperCase().trim().replace(/\s+/g, "_")
    );
    if (!normAllowedRoles.includes(role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 3. Check Specific Permission Requirement if provided (ADMIN role bypasses permission list checks)
  if (requiredPermission && role !== "ADMIN" && role !== "CUSTOMER") {
    const userPerms = (user.permissions || []).map((p) =>
      String(p).toUpperCase().replace(/\./g, "_")
    );
    const requiredList = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];

    const normRequired = requiredList.map((p) =>
      String(p).toUpperCase().replace(/\./g, "_")
    );

    const hasPerm = normRequired.some((p) => userPerms.includes(p));
    if (!hasPerm) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
