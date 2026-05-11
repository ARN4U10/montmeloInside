import Usuari from "../models/Usuaris.js";
import Esdeveniment from "../models/Esdeveniments.js";
import jwt from "jsonwebtoken";

export const getPerfil = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "No user in token" });
    }

    const user = await Usuari.findById(req.user.id).select("-contrasenya");

    if (!user) {
      return res.status(404).json({ message: "Usuari no trobat" });
    }

    return res.json(user);
  } catch (err) {
    console.error("ERROR PERFIL REAL:", err);
    return res.status(500).json({ message: "Error servidor perfil" });
  }
};

export const updatePerfil = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      nom_complet, username, bio, imatge_perfil,
      imatge_coberta, telefon, data_naixement, notificacions,
    } = req.body;

    const usuari = await Usuari.findById(userId);
    if (!usuari) return res.status(404).json({ message: "Usuari no trobat" });

    if (nom_complet    !== undefined) usuari.nom_complet    = nom_complet;
    if (username       !== undefined) usuari.username       = username;
    if (bio            !== undefined) usuari.bio            = bio;
    if (imatge_perfil  !== undefined) usuari.imatge_perfil  = imatge_perfil;
    if (imatge_coberta !== undefined) usuari.imatge_coberta = imatge_coberta;
    if (telefon        !== undefined) usuari.telefon        = telefon;
    if (data_naixement !== undefined) usuari.data_naixement = data_naixement;

    if (notificacions) {
      usuari.notificacions = { ...usuari.notificacions, ...notificacions };
    }

    await usuari.save();

    const usuariActualitzat = await Usuari.findById(userId)
      .select("-contrasenya -token -resetPasswordToken -resetPasswordExpires");

    res.json({ ok: true, message: "Perfil actualitzat correctament", usuari: usuariActualitzat });

  } catch (error) {
    console.error("Error updatePerfil:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username o correu ja en ús" });
    }
    res.status(500).json({ message: "Error del servidor" });
  }
};

export const updateImagenPerfil = async (req, res) => {
  try {
    const userId = req.user.id;
    const avatar = req.files?.avatar?.[0]?.filename;
    const banner = req.files?.banner?.[0]?.filename;
    const updateData = {};
    if (avatar) updateData.imatge_perfil  = `/uploads/${avatar}`;
    if (banner) updateData.imatge_coberta = `/uploads/${banner}`;

    const updatedUser = await Usuari.findByIdAndUpdate(userId, updateData, { new: true });
    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error subiendo imagen" });
  }
};

export const logout = async (req, res) => {
  const userId = req.user.id;
  await Usuari.findByIdAndUpdate(userId, { token: null });
  return res.redirect("/login");
};

// ── NOU: Events de l'usuari ───────────────────────────────────────────────
export const getEsdevenimentsUsuari = async (req, res) => {
  try {
    const events = await Esdeveniment.find({ usuaris: req.user.id });
    return res.json({ events });
  } catch (err) {
    console.error("Error getEsdevenimentsUsuari:", err);
    return res.status(500).json({ message: "Error del servidor" });
  }
};

// ── NOU: Historial de navegació ───────────────────────────────────────────
export const getHistorialUsuari = async (req, res) => {
  try {
    const user = await Usuari.findById(req.user.id).select("historial_navegacio");
    return res.json({ historial: user.historial_navegacio });
  } catch (err) {
    console.error("Error getHistorialUsuari:", err);
    return res.status(500).json({ message: "Error del servidor" });
  }
};