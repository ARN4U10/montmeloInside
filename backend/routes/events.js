import express from "express";
import { getEvents, getEventById, joinEvent } from "../controllers/eventsController.js";

const router = express.Router();

router.get("/", getEvents);

router.get("/:id", getEventById);

router.post("/:id/join", joinEvent);

export default router;