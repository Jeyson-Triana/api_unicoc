const mongoose = require("mongoose");

const OpcionSchema = new mongoose.Schema(
  {
    codigo: { type: String, required: true, trim: true },
    nombre: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    habilitado: { type: Boolean, default: true },
    orden: { type: Number, default: 1 }
  },
  { _id: false }
);

const CreditoSchema = new mongoose.Schema(
  {
    opciones: { type: [OpcionSchema], default: [] }
  },
  { collection: "credito" }
);

module.exports = mongoose.model("Credito", CreditoSchema);
