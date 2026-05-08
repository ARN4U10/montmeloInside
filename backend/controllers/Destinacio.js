import Destinacions from "../models/Ubicacions.js";

// GET /ubicacions?query=...
export const getDestinacions = async (req, res) => {
  try {
    const { query } = req.query;

    let filter = {};

    if (query) {
      filter = {
        $or: [
          { nom: { $regex: query, $options: "i" } },
          { direccio: { $regex: query, $options: "i" } },
          { categoria: { $regex: query, $options: "i" } },
          { tipus: { $regex: query, $options: "i" } },
        ],
      };
    }

    const ubicacions = await Destinacions.find(filter);

    res.status(200).json(ubicacions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error obtenint ubicacions" });
  }
};