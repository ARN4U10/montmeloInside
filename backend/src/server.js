import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import multer from "multer";
dotenv.config();
import usuarisRuta from "../routes/Usuaris.js"
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));


// 🔌 CONEXIÓN MONGODB
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



// TEST ROUTE
app.get("/api/hello", (req, res) => {
  res.json({ message: "Backend funcionando 🚀" });
});

app.listen(3001, () => {
  console.log("Servidor en http://localhost:3001");
});