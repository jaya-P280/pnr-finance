import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";
import ApiError from "../shared/ApiError.js";

const uploadDirectory = path.join(process.cwd(), "uploads", "kyc");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const suffix = crypto.randomBytes(6).toString("hex");
    callback(null, `${file.fieldname}-${Date.now()}-${suffix}${extension}`);
  },
});

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new ApiError(400, "KYC documents must be PDF or image files."));
      return;
    }
    callback(null, true);
  },
});

export default upload.fields([
  { name: "aadhaarFront", maxCount: 1 },
  { name: "aadhaarBack", maxCount: 1 },
  { name: "panImage", maxCount: 1 },
]);
