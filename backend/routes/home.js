import express from "express";
import { getHomeDashboard } from "../controllers/homeController.js";

const router = express.Router();

router.get("/dashboard", getHomeDashboard);

export default router;