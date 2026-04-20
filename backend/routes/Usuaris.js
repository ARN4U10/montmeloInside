import express from "express";
import { login, registre } from "../controllers/LoginRegistre.js";
import { getPerfil, updatePerfil } from "../controllers/Perfil.js";
import { get } from "mongoose";

const router = express.Router();

router.post("/register", registre);
router.post("/login", login);
router.get("/perfil", getPerfil);
router.put("/perfil", updatePerfil);

export default router;