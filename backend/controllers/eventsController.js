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

export const getEventById = async (req, res) => {
  try {
    const event = await Esdeveniment.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event no trobat" });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const joinEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "userId obligatori"
      });
    }

    const event = await Esdeveniment.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Event no trobat" });
    }

    if (!event.usuaris.includes(userId)) {
      event.usuaris.push(userId);
      await event.save();
    }

    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};