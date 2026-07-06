import express from 'express';
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from 'cookie-parser';
import morgan from "morgan";

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())
app.use(morgan("dev"))

app.get("/api/v1/health", (rea,res)=>{
    res.status(200).json({
        success: true,
        message: "PNG Finance API Running"
    });
});

export default app;