import Ubicacio from "../models/Ubicacions.js";

const SERVICE_TYPES = {
  lavabos: "Lavabos",
  lavabo: "Lavabos",
  wc: "Lavabos",
  restauracio: "Restauració",
  restauració: "Restauració",
  food: "Restauració",
  menjar: "Restauració",
  parking: "Pàrquing",
  pàrquing: "Pàrquing",
  parquing: "Pàrquing",
};

const inferTipusServei = (ubicacio) => {
  const text = [
    ubicacio.nom,
    ubicacio.tipus,
    ubicacio.categoria,
    ubicacio.descripcio,
  ].join(" ").toLowerCase();

  const match = Object.entries(SERVICE_TYPES).find(([key]) => text.includes(key));
  return match?.[1] || null;
};

const formatServei = (ubicacio) => {
  const tipus = inferTipusServei(ubicacio);

  return {
    id: ubicacio._id,
    _id: ubicacio._id,
    nom: ubicacio.nom,
    direccio: ubicacio.direccio || "",
    descripcio: ubicacio.descripcio || "",
    tipus,
    categoria: ubicacio.categoria || ubicacio.tipus || "",
    lat: ubicacio.latitud,
    lng: ubicacio.longitud,
    latitud: ubicacio.latitud,
    longitud: ubicacio.longitud,
  };
};

export const getServeis = async (req, res) => {
  try {
    const { tipus } = req.query;
    const serveis = (await Ubicacio.find())
      .map(formatServei)
      .filter((servei) => servei.tipus);

    const filtrats =
      tipus && tipus !== "Tots"
        ? serveis.filter((servei) => servei.tipus === tipus)
        : serveis;

    return res.json(filtrats);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
