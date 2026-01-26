const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  documento: { type: String, required: true, index: true, unique: true },
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  programa_id: { type: Number, required: true },
  programa_nombre: { type: String, required: true },
  etapa_id: { type: Number, required: true },        // 1,2,3,19,4
  etapa_nombre: { type: String, required: true },
  fecha_actualizacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lead', LeadSchema, 'leads_estado_inscripcion');
