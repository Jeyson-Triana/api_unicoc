const mongoose = require("mongoose");

const DecanaturaSchema = new mongoose.Schema({
  programa_id: Number,
  programa: String,
  decanatura: String,
  correo: String,
  telefono: String,
  activo: Boolean
}, {
  collection: "Decanaturas"
});

module.exports = mongoose.model("Decanatura", DecanaturaSchema);
