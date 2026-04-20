import mongoose from "mongoose";

const { Schema } = mongoose;

const UbicacioUsuariSchema = new Schema({
  usuari: {
    type: Schema.Types.ObjectId,
    ref: "Usuari",
    required: true
  },

  ubicacio: {
    type: Schema.Types.ObjectId,
    ref: "Ubicacio",
    required: true
  },

  latitud: Number,
  longitud: Number,
  temps_arribada: Date
});

export default mongoose.model("ubicaciousuari", UbicacioUsuariSchema);