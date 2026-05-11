import Usuari from "../models/Usuaris.js";

export const guardarHistorial = async (req, res) => {
  try {
    const { lloc } = req.body;

    if (!lloc?.trim())
      return res.status(400).json({ message: "Lloc buit" });

    await Usuari.findByIdAndUpdate(req.user.id, {
      $push: {
        historial_navegacio: {
          $each:     [{ lloc: lloc.trim() }],
          $position: 0,
          $slice:    50,
        },
      },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Error guardarHistorial:", err);
    return res.status(500).json({ message: "Error del servidor" });
  }
};