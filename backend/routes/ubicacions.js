import express from "express";
import { getUbicacions } from "../controllers/ubicacionsController.js";

const router = express.Router();

router.get("/", getUbicacions);

export default router;
