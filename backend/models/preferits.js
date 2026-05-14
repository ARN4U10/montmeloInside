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
    ref: "ubicacions",
    required: true
  },

  data_afegit: { type: Date, default: Date.now }
});

PreferitSchema.index({ usuari: 1, ubicacio: 1 }, { unique: true });

export default mongoose.model("preferits", PreferitSchema);
