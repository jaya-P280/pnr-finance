import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleWare from "./middleware/error.middleware.js";
import routes from "./routes/index.js";
import path from "path";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use("/uploads", express.static(path.join(import.meta.dirname, "uploads")));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api/v1", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleWare);

export default app;
