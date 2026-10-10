import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import auditMiddleware from "./middleware/audit.middleware.js";
import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleWare from "./middleware/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    frameguard: false,
  }),
);

const uploadsOptions = {
  setHeaders: (res) => {
    res.removeHeader("X-Frame-Options");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  },
};

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use("/uploads", express.static(uploadsDir, uploadsOptions));
app.use("/uploads", express.static(path.join(process.cwd(), "server", "uploads"), uploadsOptions));
app.use("/uploads", express.static(path.join(process.cwd(), "server", "src", "uploads"), uploadsOptions));

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(auditMiddleware);

// API routes
app.use("/api/v1", routes);

// Handle unmatched /api routes with 404
app.use("/api/*", notFoundMiddleware);

// Serve client dist static files and SPA fallback
const clientDistPath = path.join(process.cwd(), "client", "dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Error middleware
app.use(errorMiddleWare);

export default app;
