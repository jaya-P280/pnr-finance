export const getFullImageUrl = (req,filename,folder ="users") =>{
    if(!filename) return null;
    if(filename.startsWith("http//") || filename.startsWith("https://"))
        return filename;
    return `${req.protocol}://${req.get("host")}/uploads/${folder}/${filename}`;
}