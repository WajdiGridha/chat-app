import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    allowedTypes.includes(file.mimetype)
        ? cb(null, true)
        : cb(new Error("Only PDF and DOCX files are allowed!"), false);
};

const upload = multer({ storage, fileFilter });

export default upload;
