import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import usuarisRuta from "../routes/Usuaris.js";
import ubisRuta from "../routes/ubicacions.js";
import eventsRuta from "../routes/events.js"
import { verificarMailer } from "../utils/mailer.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api/ubicacions", ubisRuta);
app.use("/api/events", eventsRuta);

mongoose.connect("mongodb://localhost:27017/montmeloInside")
  .then(() => {
    console.log("MongoDB conectado");
  })
  .catch((err) => {
    console.error("Error MongoDB", err);
  });

app.use("/api", usuarisRuta);

app.post("/api/register", (req, res) => {
  console.log("HIT REGISTER");
  res.send("ok");
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend funcionando 🚀" });
});

verificarMailer();

app.listen(3001, () => {
  console.log("Servidor en http://localhost:3001");
});