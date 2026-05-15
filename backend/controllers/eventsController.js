import Esdeveniment from "../models/Esdeveniments.js";

const findEventByAnyId = async (id) => {
  if (/^[a-fA-F0-9]{24}$/.test(id)) {
    const event = await Esdeveniment.findById(id);
    if (event) return event;
  }

  return Esdeveniment.collection.findOne({
    $or: [{ _id: id }, { id }],
  });
};

const formatEvent = (event, userId = null) => {
  const usuaris = event.usuaris || [];
  const placesOcupades = usuaris.length;
  const placesTotals = event.numEntrades ?? 0;

  return {
    id: event._id,
    _id: event._id,
    nom: event.nom,
    descripcio: event.descripcio,
    numEntrades: event.numEntrades,
    placesRestants: placesTotals ? Math.max(placesTotals - placesOcupades, 0) : null,
    preu: event.preu,
    direccio: event.direccio || "",
    latitud: event.latitud,
    longitud: event.longitud,
    ubicacio: event.ubicacio,
    imatge: event.imatge || "",
    data: event.data || "",
    horaInici: event.horaInici || "",
    horaFi: event.horaFi || "",
    durada: event.durada || "",
    tipus: event.tipus || "",
    categoria: event.categoria || "",
    destacat: event.destacat || false,
    estat: event.estat || "actiu",
    usuaris,
    inscrit: userId ? usuaris.some((id) => id.toString() === userId) : false,
  };
};

export const getEvents = async (req, res) => {
  try {
    const data = await Esdeveniment.find().sort({ data: 1, horaInici: 1 });
    const formatted = data.map((event) => formatEvent(event));

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await findEventByAnyId(id);

    if (!event) {
      return res.status(404).json({ message: "Event no trobat" });
    }

    const userId = req.headers.authorization ? null : null;
    res.json(formatEvent(event, userId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const joinEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Cal iniciar sessió per inscriure's" });
    }

    const event = await findEventByAnyId(id);

    if (!event) {
      return res.status(404).json({ message: "Event no trobat" });
    }

    const usuaris = event.usuaris || [];
    const jaInscrit = usuaris.some((usuari) => usuari.toString() === userId);

    if (jaInscrit) {
      return res.json({
        message: "Ja estàs inscrit",
        event: formatEvent(event, userId),
      });
    }

    if (event.numEntrades && usuaris.length >= event.numEntrades) {
      return res.status(400).json({ message: "No queden places disponibles" });
    }

    if (typeof event.save === "function") {
      event.usuaris.push(userId);
      await event.save();
    } else {
      await Esdeveniment.collection.updateOne(
        { _id: event._id },
        { $addToSet: { usuaris: userId } }
      );
    }

    const updatedEvent = await findEventByAnyId(id);

    res.json({
      message: "Inscripció feta correctament",
      event: formatEvent(updatedEvent, userId),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
