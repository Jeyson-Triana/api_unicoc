const mongoose = require("mongoose");

const PQRSchema = new mongoose.Schema({
  radicado: String,
  documento: String,
  nombre: String,
  correo: String,
  telefono: String,
  rol: String,
  tipo_pqr: String,
  asunto: String,
  mensaje: String,
  canal: String,
  estado: {
    type: String,
    default: "registrado"
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
}, {
  collection: "PQR"
});

module.exports = mongoose.model("PQR", PQRSchema);
