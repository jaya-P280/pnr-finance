import crypto from "crypto";
import auditService from "../modules/audit/audit.service.js";

const SENSITIVE_FIELDS = [
  "password",
  "confirmPassword",
  "password_hash",
  "token",
  "accessToken",
  "refreshToken",
  "otp",
  "secret",
  "creditCard",
  "cvv",
];

function sanitizeObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      clean[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      clean[key] = sanitizeObject(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

function deriveModuleAndAction(req) {
  const url = req.originalUrl || req.url || "";
  const method = req.method.toUpperCase();

  let moduleName = "SYSTEM";
  let actionName = `${method}_REQUEST`;

  if (url.includes("/auth")) {
    moduleName = "AUTH";
    if (url.includes("/login")) actionName = "USER_LOGIN";
    else if (url.includes("/register")) actionName = "USER_REGISTER";
    else if (url.includes("/logout")) actionName = "USER_LOGOUT";
    else if (url.includes("/refresh")) actionName = "REFRESH_TOKEN";
  } else if (url.includes("/loans")) {
    moduleName = "LOANS";
    actionName = method === "POST" ? "CREATE_LOAN" : method === "PUT" ? "UPDATE_LOAN" : "FETCH_LOANS";
  } else if (url.includes("/loan-application")) {
    moduleName = "LOAN_APPLICATIONS";
    actionName = method === "POST" ? "SUBMIT_APPLICATION" : method === "PUT" ? "UPDATE_APPLICATION" : "FETCH_APPLICATIONS";
  } else if (url.includes("/customers")) {
    moduleName = "CUSTOMERS";
    actionName = method === "POST" ? "CREATE_CUSTOMER" : method === "PUT" ? "UPDATE_CUSTOMER" : "FETCH_CUSTOMERS";
  } else if (url.includes("/users")) {
    moduleName = "USERS";
    actionName = method === "POST" ? "CREATE_USER" : method === "PUT" ? "UPDATE_USER" : "FETCH_USERS";
  } else if (url.includes("/collections")) {
    moduleName = "COLLECTIONS";
    actionName = method === "POST" ? "COLLECT_PAYMENT" : "FETCH_COLLECTIONS";
  } else if (url.includes("/finance") || url.includes("/cash-book")) {
    moduleName = "FINANCE";
    actionName = method === "POST" ? "RECORD_TRANSACTION" : "FETCH_FINANCE";
  } else if (url.includes("/branches")) {
    moduleName = "BRANCHES";
    actionName = method === "POST" ? "CREATE_BRANCH" : "FETCH_BRANCHES";
  } else if (url.includes("/roles")) {
    moduleName = "ROLES";
  } else if (url.includes("/permissions")) {
    moduleName = "PERMISSIONS";
  } else if (url.includes("/reports")) {
    moduleName = "REPORTS";
    actionName = "GENERATE_REPORT";
  } else if (url.includes("/customer")) {
    moduleName = "CUSTOMER_PORTAL";
  }

  return { moduleName, actionName };
}

export function auditMiddleware(req, res, next) {
  if (req.originalUrl?.includes("/health") || req.originalUrl?.startsWith("/uploads")) {
    return next();
  }

  const startTime = Date.now();
  const correlationId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  req.correlationId = correlationId;

  res.on("finish", () => {
    try {
      const responseTimeMs = Date.now() - startTime;
      const { moduleName, actionName } = deriveModuleAndAction(req);

      const userId = req.user?.user_id || req.user?.userId || null;
      const roleName = req.user?.role_name || req.user?.roleName || null;
      const branchId = req.user?.branch_id || req.user?.branchId || null;
      const customerId = req.user?.customer_id || req.params?.customerId || req.params?.id || null;

      const sanitizedBody = req.body ? JSON.stringify(sanitizeObject(req.body)) : null;
      const sanitizedParams = req.params && Object.keys(req.params).length ? JSON.stringify(req.params) : null;

      const isSuccess = res.statusCode >= 200 && res.statusCode < 400 ? 1 : 0;
      const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";
      const userAgent = req.get("User-Agent") || "";

      auditService.log({
        userId,
        roleName,
        branchId,
        customerId: customerId && !isNaN(Number(customerId)) ? Number(customerId) : null,
        action: actionName,
        module: moduleName,
        httpMethod: req.method,
        endpoint: req.originalUrl || req.url,
        ipAddress,
        userAgent,
        requestParams: sanitizedParams,
        requestBody: sanitizedBody,
        responseStatus: res.statusCode,
        responseTimeMs,
        isSuccess,
        correlationId,
        description: `${req.method} ${req.originalUrl || req.url} - Status ${res.statusCode} (${responseTimeMs}ms)`,
      }).catch((err) => {
        console.warn("Audit logging background error:", err?.message || err);
      });
    } catch {
      // ignore finish hooks errors
    }
  });

  next();
}

export default auditMiddleware;
