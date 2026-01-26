// models/ReciboPago.js
const mongoose = require('mongoose');

const ReciboPagoSchema = new mongoose.Schema({
  documento: { type: String, required: true },
  periodo: { type: String, required: false },
  tipo: { type: String, required: false }, // ejemplo: "recibo_matricula"
  receipt_url: { type: String, required: true },
  fecha_actualizacion: { type: String, required: false }
});

module.exports = mongoose.model('ReciboPago', ReciboPagoSchema, 'recibos_pago');