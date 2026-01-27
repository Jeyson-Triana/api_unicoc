const mongoose = require("mongoose");

const DirectorioSchema = new mongoose.Schema({
  nombre: String,
  cargo: String,
  area: String,
  sede: String,
  zona: String,
  correo: String,
  telefono: String,
  extension: String,
  activo: Boolean
}, {
  collection: "Recursos_hunamos"
});

module.exports = mongoose.model("RecursosHumanos", DirectorioSchema);
