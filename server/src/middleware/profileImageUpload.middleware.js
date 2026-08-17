import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";
import ApiError from "../shared/ApiError.js";

const isVercel = Boolean(process.env.VERCEL);
const uploadDirectory = isVercel
  ? path.join("/tmp", "uploads", "profiles")
  : path.join(process.cwd(), "uploads", "profiles");

try {
  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }
} catch {
  // Ignore directory creation errors in read-only environment
}

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const suffix = crypto.randomBytes(6).toString("hex");
    callback(null, `profile-${Date.now()}-${suffix}${extension}`);
  },
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new ApiError(400, "Profile image must be JPEG, PNG, or WebP."));
      return;
    }
    callback(null, true);
  },
});

export default upload.single("profileImage");
