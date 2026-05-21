import Preferit from "../models/preferits.js";
import Ubicacio from "../models/Ubicacions.js";
import mongoose from "mongoose";

const toId = (value) => value?.toString?.() || String(value);

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const resolveUbicacio = async (body = {}) => {
  const rawId =
    body.ubicacioId ||
    body.id ||
    body._id ||
    body.ubicacio?.id ||
    body.ubicacio?._id;

  if (rawId) {
    const ubicacioId = toId(rawId);

    if (!mongoose.Types.ObjectId.isValid(ubicacioId)) {
      return { error: "ubicacioId invàlid" };
    }

    const ubicacio = await Ubicacio.findById(ubicacioId);
    if (ubicacio) return { ubicacio };
  }

  const punt = body.punt || body.ubicacio || body;
  const nom = punt.nom || punt.label || punt.name;
  const lat = toNumber(punt.lat ?? punt.latitud);
  const lng = toNumber(punt.lng ?? punt.longitud);

  if (nom) {
    const ubicacio = await Ubicacio.findOne({
      nom: new RegExp(`^${escapeRegex(nom)}$`, "i"),
    });

    if (ubicacio) return { ubicacio };
  }

  if (lat !== null && lng !== null) {
    const epsilon = 0.00001;
    const ubicacio = await Ubicacio.findOne({
      latitud: { $gte: lat - epsilon, $lte: lat + epsilon },
      longitud: { $gte: lng - epsilon, $lte: lng + epsilon },
    });

    if (ubicacio) return { ubicacio };
  }

  return { error: "Ubicació no trobada" };
};

const getPreferitSnapshot = (body = {}, ubicacio = {}) => {
  const punt = body.punt || body.ubicacio || body;

  return {
    nom: punt.nom || punt.label || punt.name || ubicacio.nom || "Ubicació",
    direccio:
      punt.direccio ||
      punt.sublabel ||
      punt.subtitle ||
      ubicacio.direccio ||
      "",
    categoria:
      punt.categoria ||
      punt.tipus ||
      punt.type ||
      ubicacio.categoria ||
      ubicacio.tipus ||
      "",
  };
};

const formatPreferit = (preferit) => {
  const ubicacio = preferit.ubicacio;
  const ubicacioDoc =
    ubicacio && typeof ubicacio === "object" && "nom" in ubicacio
      ? ubicacio
      : null;
  const ubicacioId = ubicacioDoc?._id || ubicacio || preferit.ubicacio;

  return {
    id: toId(preferit._id),
    ubicacioId: toId(ubicacioId),
    nom: preferit.nom || ubicacioDoc?.nom || "",
    direccio: preferit.direccio || ubicacioDoc?.direccio || "",
    categoria: preferit.categoria || ubicacioDoc?.categoria || ubicacioDoc?.tipus || "",
    data_afegit: preferit.data_afegit,
    ubicacio: ubicacioDoc
      ? {
          id: toId(ubicacioDoc._id),
          _id: toId(ubicacioDoc._id),
          nom: preferit.nom || ubicacioDoc.nom,
          direccio: preferit.direccio || ubicacioDoc.direccio || "",
          descripcio: ubicacioDoc.descripcio || "",
          tipus: ubicacioDoc.tipus || "",
          categoria: preferit.categoria || ubicacioDoc.categoria || "",
          lat: ubicacioDoc.latitud,
          lng: ubicacioDoc.longitud,
          latitud: ubicacioDoc.latitud,
          longitud: ubicacioDoc.longitud,
        }
      : null,
  };
};

export const getPreferits = async (req, res) => {
  try {
    const preferits = await Preferit.find({ usuari: req.user.id })
      .populate({ path: "ubicacio", model: Ubicacio })
      .sort({ data_afegit: -1 });

    return res.json({ preferits: preferits.map(formatPreferit) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const addPreferit = async (req, res) => {
  try {
    const { ubicacio, error } = await resolveUbicacio(req.body);

    if (!ubicacio) {
      const status = error === "ubicacioId invàlid" ? 400 : 404;
      return res.status(status).json({ message: error });
    }

    const normalizedUbicacioId = toId(ubicacio._id);
    const snapshot = getPreferitSnapshot(req.body, ubicacio);

    const preferit = await Preferit.findOneAndUpdate(
      { usuari: req.user.id, ubicacio: normalizedUbicacioId },
      { usuari: req.user.id, ubicacio: normalizedUbicacioId, ...snapshot },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
    ).populate({ path: "ubicacio", model: Ubicacio });

    return res.status(201).json({ preferit: formatPreferit(preferit) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deletePreferit = async (req, res) => {
  try {
    const ubicacioId = toId(req.params.ubicacioId);

    if (!mongoose.Types.ObjectId.isValid(ubicacioId)) {
      return res.status(400).json({ message: "ubicacioId invàlid" });
    }

    const deleted = await Preferit.findOneAndDelete({
      usuari: req.user.id,
      ubicacio: ubicacioId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Preferit no trobat" });
    }

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
