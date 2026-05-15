import express from "express";
import { getEvents, getEventById, joinEvent } from "../controllers/eventsController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getEvents);

router.get("/:id", getEventById);

router.post("/:id/join", authMiddleware, joinEvent);

export default router;
