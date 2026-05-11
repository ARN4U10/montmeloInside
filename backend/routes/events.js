import express from "express";
import { getEvents } from "../controllers/eventsController.js";
import uploadEventImage from "../middleware/upload.js";

const router = express.Router();

// GET events
router.get("/", getEvents);


export default router;