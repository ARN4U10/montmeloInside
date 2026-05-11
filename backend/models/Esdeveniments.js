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
  },

  data: {
    type: String,
    default: ""
  },

  horaInici: {
    type: String,
    default: ""
  },

  horaFi: {
    type: String,
    default: ""
  },

  durada: {
    type: String,
    default: ""
  },

  tipus: {
    type: String,
    default: ""
  },

  categoria: {
    type: String,
    default: ""
  },

  destacat: {
    type: Boolean,
    default: false
  },

  estat: {
    type: String,
    enum: ["actiu", "cancel·lat", "finalitzat"],
    default: "actiu"
  }
});

export default mongoose.model("esdeveniments", EsdevenimentSchema);