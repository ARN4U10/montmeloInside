import express from "express";
import { login, registre } from "../controllers/LoginRegistre.js";
import {
  getPerfil,
  updatePerfil,
  updateImagenPerfil,
} from "../controllers/Perfil.js";
import {
  solicitarRecuperacio,
  verificarCodiRecuperacio,
  restablirPassword,
} from "../controllers/RecuperacioPassword.js";
import upload from "../middleware/upload.js";
import { authMiddleware } from "../middleware/auth.js";
import { getDestinacions } from "../controllers/Destinacio.js";

const router = express.Router();

router.post("/register", registre);
router.post("/login", login);

router.post("/forgot-password", solicitarRecuperacio);
router.post("/verify-reset-code", verificarCodiRecuperacio);
router.post("/reset-password", restablirPassword);
router.get("/destinacions", getDestinacions);
router.get("/perfil", authMiddleware, getPerfil);
router.put("/perfil", authMiddleware, updatePerfil);

router.put(
  "/perfil/imagen",
  authMiddleware,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateImagenPerfil
);

export default router;