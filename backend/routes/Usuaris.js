import express from "express";

import { login, registre } from "../controllers/LoginRegistre.js";
import { guardarHistorial } from "../controllers/historial.js";

import {
  getPerfil,
  updatePerfil,
  updateImagenPerfil,
  getEsdevenimentsUsuari,
  getHistorialUsuari
} from "../controllers/Perfil.js";

import {
  solicitarRecuperacio,
  verificarCodiRecuperacio,
  restablirPassword,
} from "../controllers/RecuperacioPassword.js";

import {
  googleLogin,
} from "../controllers/SocialAuth.js";

import upload from "../middleware/upload.js";
import { authMiddleware } from "../middleware/auth.js";
import { getDestinacions } from "../controllers/Destinacio.js";

const router = express.Router();

router.post("/register", registre);
router.post("/login", login);

router.post("/google-login", googleLogin);

router.post("/forgot-password", solicitarRecuperacio);
router.post("/verify-reset-code", verificarCodiRecuperacio);
router.post("/reset-password", restablirPassword);

router.get("/destinacions", getDestinacions);
router.get("/perfil/events",    authMiddleware, getEsdevenimentsUsuari);
router.get("/perfil/historial", authMiddleware, getHistorialUsuari);

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

router.post("/historial", authMiddleware, guardarHistorial);

export default router;
