const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  ticket_id: String,
  documento: String,
  nombre: String,
  correo: String,
  rol: String,
  asunto: String,
  mensaje: String,
  canal: String,
  estado: {
    type: String,
    default: "abierto"
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
}, {
  collection: "TicketsSoporte"
});

module.exports = mongoose.model("Ticket_soporte", TicketSchema);
