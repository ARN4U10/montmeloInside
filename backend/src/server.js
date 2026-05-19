import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dns from "node:dns";

import usuarisRuta from "../routes/Usuaris.js";
import homeRuta from "../routes/home.js";
import ubisRuta from "../routes/ubicacions.js";
import eventsRuta from "../routes/events.js";
import serveisRuta from "../routes/serveis.js";
import preferitsRuta from "../routes/preferits.js";
import { verificarMailer } from "../utils/mailer.js";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

app.use("/api/ubicacions", ubisRuta);
app.use("/api/events", eventsRuta);
app.use("/api/home", homeRuta);
app.use("/api/serveis", serveisRuta);
app.use("/api/preferits", preferitsRuta);

console.log("MONGO_URI carregada:", Boolean(process.env.MONGO_URI));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas conectado");
  })
  .catch((err) => {
    console.error("Error MongoDB Atlas:", err);
  });

app.use("/api", usuarisRuta);

app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend funcionando" });
});

verificarMailer();

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});