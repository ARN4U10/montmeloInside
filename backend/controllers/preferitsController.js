import Preferit from "../models/preferits.js";
import Ubicacio from "../models/Ubicacions.js";

const formatPreferit = (preferit) => {
  const ubicacio = preferit.ubicacio;

  return {
    id: preferit._id,
    ubicacioId: ubicacio?._id || preferit.ubicacio,
    data_afegit: preferit.data_afegit,
    ubicacio: ubicacio?._id
      ? {
          id: ubicacio._id,
          _id: ubicacio._id,
          nom: ubicacio.nom,
          direccio: ubicacio.direccio || "",
          descripcio: ubicacio.descripcio || "",
          tipus: ubicacio.tipus || "",
          categoria: ubicacio.categoria || "",
          lat: ubicacio.latitud,
          lng: ubicacio.longitud,
          latitud: ubicacio.latitud,
          longitud: ubicacio.longitud,
        }
      : null,
  };
};

export const getPreferits = async (req, res) => {
  try {
    const preferits = await Preferit.find({ usuari: req.user.id })
      .populate("ubicacio")
      .sort({ data_afegit: -1 });

    return res.json({ preferits: preferits.map(formatPreferit) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const addPreferit = async (req, res) => {
  try {
    const { ubicacioId } = req.body;

    if (!ubicacioId) {
      return res.status(400).json({ message: "ubicacioId obligatori" });
    }

    const ubicacio = await Ubicacio.findById(ubicacioId);
    if (!ubicacio) {
      return res.status(404).json({ message: "Ubicació no trobada" });
    }

    const preferit = await Preferit.findOneAndUpdate(
      { usuari: req.user.id, ubicacio: ubicacioId },
      { usuari: req.user.id, ubicacio: ubicacioId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate("ubicacio");

    return res.status(201).json({ preferit: formatPreferit(preferit) });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deletePreferit = async (req, res) => {
  try {
    const deleted = await Preferit.findOneAndDelete({
      usuari: req.user.id,
      ubicacio: req.params.ubicacioId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Preferit no trobat" });
    }

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
