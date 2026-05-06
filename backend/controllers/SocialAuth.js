import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import appleSignin from "apple-signin-auth";
import Usuari from "../models/Usuaris.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || "SECRET";

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const generarToken = (usuari) => {
  return jwt.sign(
    {
      id: usuari._id,
      correu: usuari.correu,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const respostaUsuari = (usuari) => ({
  id: usuari._id,
  nom_complet: usuari.nom_complet,
  correu: usuari.correu,
  username: usuari.username || "",
  imatge_perfil: usuari.imatge_perfil || "",
});

const crearUsuariSocial = async ({ nom_complet, correu, imatge_perfil }) => {
  const randomPassword = Math.random().toString(36).slice(2) + Date.now();
  const hash = await bcrypt.hash(randomPassword, 10);

  return Usuari.create({
    nom_complet,
    correu,
    contrasenya: hash,
    username: null,
    bio: "",
    imatge_perfil: imatge_perfil || "",
    imatge_coberta: "",
    telefon: "",
    data_naixement: null,
    notificacions: {
      email: true,
      push: true,
    },
    historial_navegacio: [],
    ubicacioUsuari: null,
    esdeveniment: null,
    token: null,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: "Falta credential de Google" });
    }

    if (!GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "GOOGLE_CLIENT_ID no configurat" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const correu = payload.email;
    const nom_complet = payload.name || "Usuari Google";
    const imatge_perfil = payload.picture || "";

    if (!correu) {
      return res.status(400).json({ message: "Google no ha retornat correu" });
    }

    let usuari = await Usuari.findOne({ correu });

    if (!usuari) {
      usuari = await crearUsuariSocial({
        nom_complet,
        correu,
        imatge_perfil,
      });
    }

    const token = generarToken(usuari);

    return res.json({
      token,
      accessToken: token,
      user: respostaUsuari(usuari),
    });
  } catch (error) {
    console.error("Error googleLogin:", error);
    return res.status(500).json({ message: "Error iniciant sessió amb Google" });
  }
};

export const appleLogin = async (req, res) => {
  try {
    const { identityToken } = req.body;

    if (!identityToken) {
      return res.status(400).json({ message: "Falta identityToken d'Apple" });
    }

    if (!APPLE_CLIENT_ID) {
      return res.status(500).json({ message: "APPLE_CLIENT_ID no configurat" });
    }

    const appleData = await appleSignin.verifyIdToken(identityToken, {
      audience: APPLE_CLIENT_ID,
      ignoreExpiration: false,
    });

    const correu = appleData.email;
    const appleSub = appleData.sub;

    if (!correu) {
      return res.status(400).json({
        message:
          "Apple no ha retornat correu. Revisa la configuració de scope email.",
      });
    }

    let usuari = await Usuari.findOne({ correu });

    if (!usuari) {
      usuari = await crearUsuariSocial({
        nom_complet: "Usuari Apple",
        correu,
        imatge_perfil: "",
      });
    }

    const token = generarToken(usuari);

    return res.json({
      token,
      accessToken: token,
      appleSub,
      user: respostaUsuari(usuari),
    });
  } catch (error) {
    console.error("Error appleLogin:", error);
    return res.status(500).json({ message: "Error iniciant sessió amb Apple" });
  }
};