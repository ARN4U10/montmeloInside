import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import usuarisRuta from "../routes/Usuaris.js";
import ubisRuta from "../routes/ubicacions.js";
import eventsRuta from "../routes/events.js";
import serveisRuta from "../routes/serveis.js";
import preferitsRuta from "../routes/preferits.js";
import { verificarMailer } from "../utils/mailer.js";

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/montmeloInside";

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

app.use("/api/ubicacions", ubisRuta);
app.use("/api/events", eventsRuta);
app.use("/api/serveis", serveisRuta);
app.use("/api/preferits", preferitsRuta);

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB conectado");
  })
  .catch((err) => {
    console.error("Error MongoDB", err);
  });

app.use("/api", usuarisRuta);

app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend funcionando" });
});

verificarMailer();

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
