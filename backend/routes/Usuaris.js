import express from "express";
import { login, registre } from "../controllers/LoginRegistre.js";
import { getPerfil, updatePerfil, updateImagenPerfil } from "../controllers/Perfil.js";
import upload from "../middleware/upload.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registre);
router.post("/login", login);

router.get("/perfil", authMiddleware, getPerfil);
router.put("/perfil", authMiddleware, updatePerfil);

router.put(
  "/perfil/imagen",
  authMiddleware,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 }
  ]),
  updateImagenPerfil
);

export default router;