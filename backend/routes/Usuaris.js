import express from "express";
import { login, registre } from "../controllers/LoginRegistre.js";
import { getPerfil, updatePerfil, updateImagenPerfil } from "../controllers/Perfil.js";
import upload from "../middleware/upload.js";

import { get } from "mongoose";

const router = express.Router();
router.put("/perfil/imagen", auth, upload.fields([ { name: "avatar", maxCount: 1 }, { name: "banner", maxCount: 1 }]), updateImagenPerfil);
router.post("/register", registre);
router.post("/login", login);
router.get("/perfil", getPerfil);
router.put("/perfil", updatePerfil);

export default router;