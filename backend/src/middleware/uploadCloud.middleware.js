import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    allowedTypes.includes(file.mimetype)
        ? cb(null, true)
        : cb(new Error("Only PDF and DOCX files are allowed!"), false);
};

const upload = multer({ storage, fileFilter });

export default upload;
