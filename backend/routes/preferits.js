import express from "express";
import { addPreferit, deletePreferit, getPreferits } from "../controllers/preferitsController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, getPreferits);
router.post("/", authMiddleware, addPreferit);
router.delete("/:ubicacioId", authMiddleware, deletePreferit);

export default router;
