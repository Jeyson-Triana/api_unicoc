const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  _id: String,
  seq: Number
}, { collection: "Counters" });

module.exports = mongoose.model("Counter", CounterSchema);
