
export function getFullImageUrl(req, imagePath, folder = "users") {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/uploads/${folder}/${imagePath}`;
}