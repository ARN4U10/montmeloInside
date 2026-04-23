import bcrypt from "bcrypt";
import crypto from "crypto";
import Usuari from "../models/Usuaris.js";
import { enviarCodiRecuperacio } from "../utils/mailer.js";

const generarCodi = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const solicitarRecuperacio = async (req, res) => {
  try {
    const { correu } = req.body;

    if (!correu) {
      return res.status(400).json({ message: "El correu és obligatori" });
    }

    const usuari = await Usuari.findOne({ correu });

    // Important: no revelar si existeix o no
    if (!usuari) {
      return res.json({
        ok: true,
        message: "Si el correu existeix, s'ha enviat un codi de recuperació",
      });
    }

    const codi = generarCodi();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    usuari.resetPasswordToken = codi;
    usuari.resetPasswordExpires = expires;
    await usuari.save();

    await enviarCodiRecuperacio(correu, codi);

    return res.json({
      ok: true,
      message: "Si el correu existeix, s'ha enviat un codi de recuperació",
    });
  } catch (error) {
    console.error("Error solicitarRecuperacio:", error);
    return res.status(500).json({ message: "Error enviant el correu" });
  }
};

export const verificarCodiRecuperacio = async (req, res) => {
  try {
    const { correu, codi } = req.body;

    if (!correu || !codi) {
      return res.status(400).json({ message: "Falten dades" });
    }

    const usuari = await Usuari.findOne({ correu });

    if (!usuari) {
      return res.status(400).json({ message: "Codi incorrecte o caducat" });
    }

    if (
      usuari.resetPasswordToken !== codi ||
      !usuari.resetPasswordExpires ||
      usuari.resetPasswordExpires < new Date()
    ) {
      return res.status(400).json({ message: "Codi incorrecte o caducat" });
    }

    return res.json({
      ok: true,
      message: "Codi correcte",
    });
  } catch (error) {
    console.error("Error verificarCodiRecuperacio:", error);
    return res.status(500).json({ message: "Error verificant el codi" });
  }
};

export const restablirPassword = async (req, res) => {
  try {
    const { correu, codi, novaPassword } = req.body;

    if (!correu || !codi || !novaPassword) {
      return res.status(400).json({ message: "Falten dades" });
    }

    if (novaPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "La contrasenya ha de tenir almenys 6 caràcters" });
    }

    const usuari = await Usuari.findOne({ correu });

    if (!usuari) {
      return res.status(400).json({ message: "Codi incorrecte o caducat" });
    }

    if (
      usuari.resetPasswordToken !== codi ||
      !usuari.resetPasswordExpires ||
      usuari.resetPasswordExpires < new Date()
    ) {
      return res.status(400).json({ message: "Codi incorrecte o caducat" });
    }

    const hash = await bcrypt.hash(novaPassword, 10);

    usuari.contrasenya = hash;
    usuari.resetPasswordToken = null;
    usuari.resetPasswordExpires = null;

    await usuari.save();

    return res.json({
      ok: true,
      message: "Contrasenya actualitzada correctament",
    });
  } catch (error) {
    console.error("Error restablirPassword:", error);
    return res.status(500).json({ message: "Error actualitzant la contrasenya" });
  }
};