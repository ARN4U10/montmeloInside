import Esdeveniment from "../models/Esdeveniments.js";

export const getEvents = async (req, res) => {
  try {
    const data = await Esdeveniment.find();

    const formatted = data.map((u) => ({
      id: u._id,

      nom: u.nom,
      descripcio: u.descripcio,

      numEntrades: u.numEntrades,
      preu: u.preu,

      direccio: u.direccio || "",

      latitud: u.latitud,
      longitud: u.longitud,

      ubicacio: u.ubicacio,

      imatge: u.imatge || ""
    }));

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


