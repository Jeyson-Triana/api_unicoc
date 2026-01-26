// models/DescuentoPromocion.js
const mongoose = require("mongoose");

const descuentoPromocionSchema = new mongoose.Schema(
  {
    tipo: { type: String }, // "beca", "convenio", "descuento"
    nombre: { type: String, required: true },
    descripcion: { type: String },
    requisitos: { type: [String] },
    beneficios: { type: [String] },
    estado: { type: String, default: "activo" },
    fecha_inicio: { type: String },
    fecha_fin: { type: String }
  },
  { collection: "Descuentos_promociones" } // nombre EXACTO en tu MongoDB
);

module.exports = mongoose.model("Descuentos_promociones", descuentoPromocionSchema);
