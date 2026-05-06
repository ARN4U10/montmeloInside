import Ubicacio from "../models/Ubicacions.js";

export const getUbicacions = async (req, res) => {
  try {
    const data = await Ubicacio.find();

    const formatted = data.map(u => ({
      id: u._id,
      label: u.nom,
      lat: u.latitud,
      lng: u.longitud,
      sublabel: u.direccio || "",
      categoria: u.descripcio, // o mapea si quieres
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};