export const ROLE_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
};

export const SYSTEM_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  BRANCH_MANAGER: "BRANCH_MANAGER",
  FIELD_OFFICER: "FIELD_OFFICER",
  ACCOUNTANT: "ACCOUNTANT",
  AUDITOR: "AUDITOR",
};

export const PROTECTED_ROLES = [
  SYSTEM_ROLES.SUPER_ADMIN,
  SYSTEM_ROLES.ADMIN,
  SYSTEM_ROLES.BRANCH_MANAGER,
  SYSTEM_ROLES.FIELD_OFFICER,
  SYSTEM_ROLES.ACCOUNTANT,
  SYSTEM_ROLES.AUDITOR,
];

export const ROLE_MESSAGES = {
  FETCH_SUCCESS: "Roles fetched successfully.",
  FETCH_ONE_SUCCESS: "Role fetched successfully.",
  CREATE_SUCCESS: "Role created successfully.",
  UPDATE_SUCCESS: "Role updated successfully.",
  DELETE_SUCCESS: "Role deleted successfully.",
  STATUS_UPDATED: "Role status updated successfully.",
  PERMISSIONS_UPDATED: "Role permissions updated successfully.",

  NOT_FOUND: "Role not found.",
  ROLE_EXISTS: "Role name already exists.",
  INVALID_STATUS: "Invalid role status.",
  PROTECTED_ROLE: "System roles cannot be modified.",
  CANNOT_DELETE: "This role cannot be deleted.",
  CANNOT_DEACTIVATE: "This role cannot be deactivated.",
};