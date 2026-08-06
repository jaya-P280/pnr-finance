import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import auditMiddleware from "./middleware/audit.middleware.js";
import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleWare from "./middleware/error.middleware.js";
import routes from "./routes/index.js";
import path from "path";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use("/uploads", express.static(path.join(process.cwd(), "server", "uploads")));

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

// Error middleware
app.use(errorMiddleWare);

export default app;
