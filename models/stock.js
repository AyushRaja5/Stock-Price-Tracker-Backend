// models/stock.js
const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    name: String,
    price: Number,
    lastUpdated: Date,
});

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
