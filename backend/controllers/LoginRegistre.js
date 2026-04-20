import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usuari from "../models/Usuaris.js";

export const registre = async (req, res) => {
  try {
    const { nom_complet, correu, contrasenya } = req.body;

    if (!nom_complet || !correu || !contrasenya) {
      return res.status(400).json({ message: "Falten camps" });
    }

    const userExists = await Usuari.findOne({ correu });
    if (userExists) {
      return res.status(400).json({ message: "Ja existeix" });
    }

    const hash = await bcrypt.hash(contrasenya, 10);

    const user = await Usuari.create({
      nom_complet,
      correu,
      contrasenya: hash,
    });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        nom_complet: user.nom_complet,
        correu: user.correu,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar" });
  }
};

export const login = async (req, res) => {
  try {
    console.log("BODY LOGIN:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Falten camps" });
    }

    const user = await Usuari.findOne({ correu: email });

    if (!user) {
      return res.status(400).json({ message: "Usuari no existeix" });
    }

    const valid = await bcrypt.compare(password, user.contrasenya);

    if (!valid) {
      return res.status(400).json({ message: "Password incorrecte" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "SECRET",
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        nom_complet: user.nom_complet,
        correu: user.correu,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error servidor" });
  }
};