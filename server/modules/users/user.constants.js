export const USER_STATUS = Object.freeze({
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    LOCKED: "LOCKED",
});

export const EMPLOYEE = Object.freeze({
    PREFIX: "EMP",
    PAD_LENGTH: 6,
})

export const USER_MESSAGES = Object.freeze({
    CREATED: "User created successfully.",
    UPDATED: "User updated successfully.",
    DELETED: "User deleted successfully.",

    FETCHED: "User fetched successfully.",
    FETCHED_ALL: "Users fetched successfully.",

    NOT_FOUND: "User not found.",

    EMAIL_EXISTS: "Email already exists.",
    PHONE_EXISTS: "Phone number already exists.",
    EMPLOYEE_EXISTS: "Employee code already exists.",

    ROLE_NOT_FOUND: "Role not found.",
    BRANCH_NOT_FOUND: "Branch not found.",

    INVALID_STATUS: "Invalid user status.",

    PASSWORD_CHANGED: "Password changed successfully.",
    PASSWORD_RESET: "Password reset successfully.",

    CANNOT_DELETE_SELF:
        "You cannot delete your own account.",

    LAST_SUPER_ADMIN:
        "Cannot delete the last active Super Admin.",

    USER_DELETED:
        "User deleted successfully."

});

export const PASSWORD = Object.freeze({
    LENGTH: 8,
});

export const IMAGE = Object.freeze({
    MAX_SIZE: 2 * 1024 * 1024,
    TYPES: [
        "image/jpeg",
        "image/png",
        "image/webp"
    ]
});

export const PAGINATION = Object.freeze({
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
});