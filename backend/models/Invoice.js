const mongoose = require('mongoose')

const itemSchema = new mongoose.Schema({
  itemNumber: String,
  description: String,
  unitPrice: Number,
  quantity: Number,
  discount: Number,
  lineTotal: Number
})

const invoiceSchema = new mongoose.Schema({
  // Master Data
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Bill To
  customerName: String,
  customerId: String,
  customerAddress: String,
  customerPhone: String,

  // Ship To
  recipientName: String,
  recipientAddress: String,
  recipientPhone: String,

  // Payment Info
  paymentDue: Date,
  salesperson: String,
  paymentTerms: String,

  // Shipping Info
  deliveryDate: Date,
  shippingMethod: String,
  shippingTerms: String,

  // Child Data - Items
  items: [itemSchema],

  // Totals
  totalDiscount: Number,
  subtotal: Number,
  salesTax: Number,
  total: Number

}, { timestamps: true })

module.exports = mongoose.model('Invoice', invoiceSchema)