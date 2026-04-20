import mongoose from "mongoose";

const { Schema } = mongoose;

const PreferitSchema = new Schema({
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

  data_afegit: { type: Date, default: Date.now }
});

export default mongoose.model("preferits", PreferitSchema);