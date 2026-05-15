import Destinacions from "../models/Ubicacions.js";

const formatDestinacio = (ubicacio) => ({
  id: ubicacio._id,
  _id: ubicacio._id,
  nom: ubicacio.nom,
  label: ubicacio.nom,
  direccio: ubicacio.direccio || "",
  sublabel: ubicacio.direccio || "",
  descripcio: ubicacio.descripcio || "",
  tipus: ubicacio.tipus || "",
  categoria: ubicacio.categoria || ubicacio.tipus || ubicacio.descripcio || "",
  lat: ubicacio.latitud,
  lng: ubicacio.longitud,
  latitud: ubicacio.latitud,
  longitud: ubicacio.longitud,
});

// GET /api/destinacions?query=...&categoria=...
export const getDestinacions = async (req, res) => {
  try {
    const { query, categoria } = req.query;
    const andFilters = [];

    if (query) {
      andFilters.push({
        $or: [
          { nom: { $regex: query, $options: "i" } },
          { direccio: { $regex: query, $options: "i" } },
          { categoria: { $regex: query, $options: "i" } },
          { tipus: { $regex: query, $options: "i" } },
          { descripcio: { $regex: query, $options: "i" } },
        ],
      });
    }

    if (categoria && categoria !== "Tots") {
      andFilters.push({
        $or: [
          { categoria: { $regex: categoria, $options: "i" } },
          { tipus: { $regex: categoria, $options: "i" } },
          { descripcio: { $regex: categoria, $options: "i" } },
        ],
      });
    }

    const filter = andFilters.length ? { $and: andFilters } : {};
    const ubicacions = await Destinacions.find(filter).limit(50);

    res.status(200).json(ubicacions.map(formatDestinacio));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obtenint ubicacions" });
  }
};
