import Usuari from "../models/Usuaris.js";
import jwt from "jsonwebtoken";

export const getPerfil = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token enviat" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token invàlid" });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "SECRET"
    );

    const user = await Usuari.findById(decoded.id).select("-contrasenya");

    if (!user) {
      return res.status(404).json({ message: "Usuari no trobat" });
    }

    res.json(user);

  } catch (err) {
    console.error("ERROR PERFIL:", err);
    res.status(500).json({ message: "Error servidor perfil" });
  }
};

/**
 * UPDATE PERFIL
 * Actualitza dades del perfil (sense tocar seguretat)
 */
export const updatePerfil = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      nom_complet,
      username,
      bio,
      imatge_perfil,
      imatge_coberta,
      telefon,
      data_naixement,
      notificacions,
    } = req.body;

    const usuari = await Usuari.findById(userId);

    if (!usuari) {
      return res.status(404).json({ message: "Usuari no trobat" });
    }

    // Actualització de camps si venen informats
    if (nom_complet !== undefined) usuari.nom_complet = nom_complet;
    if (username !== undefined) usuari.username = username;
    if (bio !== undefined) usuari.bio = bio;
    if (imatge_perfil !== undefined) usuari.imatge_perfil = imatge_perfil;
    if (imatge_coberta !== undefined) usuari.imatge_coberta = imatge_coberta;
    if (telefon !== undefined) usuari.telefon = telefon;
    if (data_naixement !== undefined) usuari.data_naixement = data_naixement;

    if (notificacions) {
      usuari.notificacions = {
        ...usuari.notificacions,
        ...notificacions,
      };
    }

    await usuari.save();

    const usuariActualitzat = await Usuari.findById(userId)
      .select("-contrasenya -token -resetPasswordToken -resetPasswordExpires");

    res.json({
      ok: true,
      message: "Perfil actualitzat correctament",
      usuari: usuariActualitzat,
    });

  } catch (error) {
    console.error("Error updatePerfil:", error);

    // Maneig d'errors típics de duplicats (username/email unique)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Username o correu ja en ús",
      });
    }

    res.status(500).json({ message: "Error del servidor" });
  }
};