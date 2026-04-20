import mongoose from "mongoose";

const { Schema } = mongoose;

const UbicacioSchema = new Schema({
  nom: { type: String, required: true },
  direccio: String,
  latitud: Number,
  longitud: Number,
  descripcio: String,
  tipus: String
});

export default mongoose.model("ubicacions", UbicacioSchema);