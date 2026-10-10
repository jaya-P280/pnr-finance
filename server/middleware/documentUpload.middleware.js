import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";
import ApiError from "../shared/ApiError.js";

const isVercel = Boolean(process.env.VERCEL);
const uploadDirectory = isVercel
  ? path.join("/tmp", "uploads", "documents")
  : path.join(process.cwd(), "uploads", "documents");

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
    callback(null, `doc-${Date.now()}-${suffix}${extension}`);
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new ApiError(400, "Document must be PDF, JPEG, PNG, or WebP."));
      return;
    }
    callback(null, true);
  },
});

const uploadFields = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "document", maxCount: 1 },
]);

export default function documentUploadMiddleware(req, res, next) {
  uploadFields(req, res, (err) => {
    if (err) return next(err);
    if (!req.file && req.files) {
      req.file = req.files.file?.[0] || req.files.document?.[0] || null;
    }

    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        const fd = fs.openSync(req.file.path, "r");
        const buffer = Buffer.alloc(16);
        fs.readSync(fd, buffer, 0, 16, 0);
        fs.closeSync(fd);

        const hex = buffer.toString("hex").toLowerCase();
        let detectedMime = null;
        let correctExt = null;

        if (hex.startsWith("ffd8ff")) {
          detectedMime = "image/jpeg";
          correctExt = ".jpg";
        } else if (hex.startsWith("89504e47")) {
          detectedMime = "image/png";
          correctExt = ".png";
        } else if (buffer.subarray(0, 4).toString("utf8") === "RIFF" && buffer.subarray(8, 12).toString("utf8") === "WEBP") {
          detectedMime = "image/webp";
          correctExt = ".webp";
        } else if (buffer.subarray(0, 4).toString("utf8") === "%PDF") {
          detectedMime = "application/pdf";
          correctExt = ".pdf";
        }

        if (detectedMime) {
          req.file.mimetype = detectedMime;
          req.file.detectedMimeType = detectedMime;

          // If extension in filename mismatches the actual type (e.g. JPG with .pdf extension)
          const currentExt = path.extname(req.file.filename).toLowerCase();
          if (correctExt && currentExt !== correctExt) {
            const newFilename = req.file.filename.replace(new RegExp(`\\${currentExt}$`, "i"), correctExt);
            const newPath = path.join(path.dirname(req.file.path), newFilename);
            fs.renameSync(req.file.path, newPath);
            req.file.filename = newFilename;
            req.file.path = newPath;
          }
        }
      } catch (inspectErr) {
        console.warn("[DocumentUpload] Could not inspect file magic bytes:", inspectErr.message);
      }
    }

    next();
  });
}
