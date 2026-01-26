// models/Matricula.js
const mongoose = require('mongoose');

const MatriculaSchema = new mongoose.Schema({
  periodo: { type: String, required: true },
  activo: { type: Boolean, default: false },
  programa_id: { type: Number, required: false },
  programa: { type: String, required: true },
  fecha_inicio: { type: String, required: false }, // YYYY-MM-DD
  fecha_fin: { type: String, required: false },    // YYYY-MM-DD
  fechas_texto: { type: String, required: true },
  observaciones: { type: String, required: false },
  fecha_actualizacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Matricula', MatriculaSchema, 'matriculas');
