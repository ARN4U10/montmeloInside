import mongoose from "mongoose";

const { Schema } = mongoose;

const EsdevenimentSchema = new Schema({
  ubicacio: {
    type: Schema.Types.ObjectId,
    ref: "Ubicacio",
    required: true
  },

  usuaris: [{
    type: Schema.Types.ObjectId,
    ref: "Usuari"
  }],

  nom: { type: String, required: true },
  descripcio: String,
  numEntrades: Number,
  preu: Number,
  direccio: String,
  latitud: Number,
  longitud: Number,

  imatge: {
    type: String,
    default: ""
  }
});

export default mongoose.model("esdeveniments", EsdevenimentSchema);