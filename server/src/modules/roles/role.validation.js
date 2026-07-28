import { body, param } from "express-validator";

export const createRoleValidation = [
  body("roleName")
    .trim()
    .notEmpty()
    .withMessage("Role name is required.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Role name must be between 3 and 100 characters."),

  body("roleDescription")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Role description cannot exceed 255 characters."),
];

export const updateRoleValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid role id."),

  body("roleName")
    .trim()
    .notEmpty()
    .withMessage("Role name is required.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Role name must be between 3 and 100 characters."),

  body("roleDescription")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Role description cannot exceed 255 characters."),
];

export const getRoleValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid role id."),
];

export const updateRoleStatusValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid role id."),

  body("isActive")
    .isBoolean()
    .withMessage("Role status must be true or false."),
];

export const deleteRoleValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid role id."),
];

export const updateRolePermissionsValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid role id."),

  body("permissionIds")
    .isArray({ min: 1 })
    .withMessage("Permission list is required."),

  body("permissionIds.*")
    .isInt({ min: 1 })
    .withMessage("Invalid permission id."),
];