const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  price: { type: Number, required: true },
  customerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  delivered: { type: Boolean, default: false },
  deliveredAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
