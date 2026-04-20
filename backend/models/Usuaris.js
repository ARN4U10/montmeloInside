import mongoose from "mongoose";

const { Schema } = mongoose;

const UsuariSchema = new Schema({
  nom_complet: { type: String, required: true },
  correu: { type: String, unique: true, required: true },
  contrasenya: { type: String, required: true },

  // Perfil
  username: { type: String, unique: true, sparse: true },
  bio: { type: String, maxlength: 160 },
  imatge_perfil: { type: String }, // URL
  imatge_coberta: { type: String }, // opcional tipo banner

  // Info extra
  telefon: { type: String },
  data_naixement: { type: Date },

  // Notificaciones (mejor estructurado que Mixed)
  notificacions: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
  },

  // Historial (puedes dejarlo flexible o tiparlo mejor)
  historial_navegacio: [
    {
      lloc: String,
      data: { type: Date, default: Date.now },
    },
  ],

  // Relaciones
  ubicacioUsuari: {
    type: Schema.Types.ObjectId,
    ref: "UbicacioUsuari",
  },

  esdeveniment: {
    type: Schema.Types.ObjectId,
    ref: "Esdeveniment",
  },

  // Seguridad
  token: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Metadata
  data_creacio: { type: Date, default: Date.now },
});

export default mongoose.model("usuaris", UsuariSchema);