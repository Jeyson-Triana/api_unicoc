const mongoose = require("mongoose");

const bienestarSchema = new mongoose.Schema({
    area : String,
    correo : String,
    telefono : String,
    horario : String,
    servicio : [String],
    activo : Boolean
}, {
    collection : "Bienestar"
});

module.exports = mongoose.model("Bienestar", bienestarSchema);