const mongoose = require('mongoose')

const lineItems = new mongoose.Schema({
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
  items: [lineItems],

  // Totals
  totalDiscount: Number,
  subtotal: Number,
  salesTax: Number,
  total: Number,

  // Add this after "total" field
status: {
  type: String,
  enum: ['draft', 'pending_manager', 'pending_finance', 'pending_director', 'approved'],
  default: 'draft'
},
approvals: [
  {
    role: String,           // who approved (manager/finance/director)
    approvedBy: String,     // username of approver
    date: {
      type: Date,
      default: Date.now     // auto set current date
    }
  }
]

}, { timestamps: true })

module.exports = mongoose.model('Invoice', invoiceSchema)