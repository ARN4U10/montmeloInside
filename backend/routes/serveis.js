import express from "express";
import { getServeis } from "../controllers/serveisController.js";

const router = express.Router();

router.get("/", getServeis);

export default router;
