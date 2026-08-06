import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Forbidden from "../pages/Forbidden";
import { ROLE_ACCESS } from "../components/constants/menu";

export default function PermissionGuard({ requiredPermission, allowedRoles, path }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role_name || user.role || "").toUpperCase().trim().replace(/\s+/g, "_");

  // SUPER_ADMIN and ADMIN have full access to all routes
  if (role === "SUPER_ADMIN" || role === "ADMIN") {
    return <Outlet />;
  }

  // If path is specified, check if the user's role has access to this path
  if (path) {
    const allowedPaths = ROLE_ACCESS[role] || [];
    if (allowedPaths.length > 0) {
      const isAllowed = allowedPaths.some(
        (p) => path === p || path.startsWith(p + "/")
      );
      if (!isAllowed) {
        return <Forbidden />;
      }
    }
  }

  // Check role restriction if provided
  if (allowedRoles && allowedRoles.length > 0) {
    const normAllowedRoles = allowedRoles.map((r) =>
      r.toUpperCase().trim().replace(/\s+/g, "_")
    );
    if (!normAllowedRoles.includes(role)) {
      return <Forbidden />;
    }
  }

  // Check permission requirement if provided
  if (requiredPermission && role !== "CUSTOMER") {
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
      return <Forbidden />;
    }
  }

  return <Outlet />;
}
