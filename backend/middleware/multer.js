import multer from "multer";

const upload=multer({
    dest:"uploads/",
    limits:{
        fileSize: 50 * 1024 * 1024,
    },
   fileFilter:(req,file,cb)=>{
        const imageTypes = ["image/jpeg", "image/png", "image/webp"];
        const videoTypes = ["video/mp4", "video/quicktime", "video/webm"];
        if (file.fieldname === "video") {
            if (videoTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error("video must be mp4, mov, or webm"));
            }
        } else {
            if (imageTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error("photos must be jpeg, png, or webp"));
            }
        }
    }
})

export default upload;