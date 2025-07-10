import multer from "multer";
import path from "path";
import { AppError } from "../errors/AppError";

// Set storage location and filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, filename);
  },
});

// Optional: File filter to allow only CSV/XLS/XLSX
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "text/csv",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Invalid file type. Only CSV, XLSX, and XLS allowed."));
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
