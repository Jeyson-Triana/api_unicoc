const mongoose = require('mongoose');

const PostgradoSchema = new mongoose.Schema({
    nombre : String,
    modalidad : String,
    duracion : String,
    jornada: String,
    matricula: String,
    sede: String,
    activo : Boolean
},
{
    collection: 'Postgrado'
});

module.exports = mongoose.model('Postgrado', PostgradoSchema);