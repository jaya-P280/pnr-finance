import fs from "fs";
import path from "path";

export function getBase64Image(imagePath, folder = "profiles") {
  if (!imagePath) return null;
  if (imagePath.startsWith("data:") || imagePath.startsWith("http")) {
    return imagePath;
  }

  try {
    const possiblePaths = [
      path.join(process.cwd(), "uploads", folder, imagePath),
      path.join(process.cwd(), "server", "uploads", folder, imagePath),
      path.join(process.cwd(), "server", "src", "uploads", folder, imagePath),
    ];

    const filePath = possiblePaths.find((p) => fs.existsSync(p));
    if (!filePath) {
      return null;
    }

    const extension = path.extname(imagePath).toLowerCase().replace(".", "");
    const mimeType =
      extension === "jpg" || extension === "jpeg"
        ? "jpeg"
        : extension === "png"
        ? "png"
        : extension === "webp"
        ? "webp"
        : "png";

    const bitmap = fs.readFileSync(filePath);
    const base64String = Buffer.from(bitmap).toString("base64");
    return `data:image/${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error("Error reading image for base64:", error);
    return null;
  }
}

export function getFullImageUrl(req, imagePath, folder = "profiles") {
  return getBase64Image(imagePath, folder);
}