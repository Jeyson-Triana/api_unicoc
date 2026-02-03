const mongoose = require('mongoose');

const ProgramaSchema = new mongoose.Schema({
    nivel: String,
    nombre : String,
    sede: String,
    activo: Boolean
},{
    collection: 'Programas'
});

module.exports = mongoose.model('Programa', ProgramaSchema);