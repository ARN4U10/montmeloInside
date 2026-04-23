import jwt from "jsonwebtoken";
import Usuari from "../models/Usuaris.js";

const SessioIniciada = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) return next();

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET");

    const user = await Usuari.findById(decoded.id);

    if (user && user.token === token) {
      return res.redirect("/home"); // o JSON si és API
    }

    next();
  } catch (err) {
    next();
  }
};

export default SessioIniciada;