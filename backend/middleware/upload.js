import multer from "multer";
import path from "path";
import fs from "fs";

// Crear carpeta si no existe
const uploadPath = "uploads/";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// Configuración almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Formato no permitido"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export default upload;