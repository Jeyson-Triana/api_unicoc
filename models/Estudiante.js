// models/Estudiante.js
const mongoose = require('mongoose');

const EstudianteSchema = new mongoose.Schema({
  documento: { type: String, required: true, index: true, unique: true },
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  programa: { type: String, required: true },
  programa_id: { type: Number, required: false },
  semestre: { type: Number, required: false },
  estado_academico: { type: String, required: false },
  fecha_actualizacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Estudiante', EstudianteSchema, 'estudiantes');