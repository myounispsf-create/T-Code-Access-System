const express = require('express')
const mongoose = require('mongoose')
const Invoice = require('../models/Invoice')
const { authMiddleware } = require('./auth')
const router = express.Router()
const stages = { manager: 'pending_manager', finance: 'pending_finance', director: 'pending_director' }
const nextStage = { manager: 'pending_finance', finance: 'pending_director', director: 'approved' }
const fields = ['invoiceNumber', 'customerName', 'customerId', 'customerAddress', 'customerPhone', 'recipientName', 'recipientAddress', 'recipientPhone', 'paymentDue', 'salesperson', 'paymentTerms', 'deliveryDate', 'shippingMethod', 'shippingTerms', 'items', 'totalDiscount', 'subtotal', 'salesTax', 'total']
function editable(body) {
  const data = {}
  for (const field of fields) if (Object.hasOwn(body || {}, field)) data[field] = body[field]
  if (Array.isArray(data.items)) data.items = data.items.map(item => {
    const clean = {}
    for (const key of ['itemNumber', 'description', 'unitPrice', 'quantity', 'discount', 'lineTotal']) if (Object.hasOwn(item || {}, key)) clean[key] = item[key]
    return clean
  })
  return data
}
function reviewScope(user) {
  if (!stages[user.role] || !user.organizationId) return null
  return { organizationId: user.organizationId, status: stages[user.role], user: { $ne: user._id } }
}
router.use(authMiddleware)
router.param('id', (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ message: 'Invalid invoice ID' })
  next()
})
function creator(req, res, next) {
  if (req.user.role !== 'creator') return res.status(403).json({ message: 'Creator access required' })
  next()
}
router.get('/', async (req, res) => {
  const scope = req.user.role === 'creator' ? { user: req.userId } : reviewScope(req.user)
  res.json(scope ? await Invoice.find(scope).sort({ createdAt: -1 }) : [])
})
router.get('/:id', async (req, res) => {
  const scope = req.user.role === 'creator' ? { user: req.userId } : reviewScope(req.user)
  const invoice = scope && await Invoice.findOne({ ...scope, _id: req.params.id })
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' })
  res.json(invoice)
})
router.post('/', creator, async (req, res) => {
  const invoice = await Invoice.create({ ...editable(req.body), user: req.userId, organizationId: req.user.organizationId || null, status: 'draft', approvals: [] })
  res.status(201).json(invoice)
})
router.put('/:id', creator, async (req, res) => {
  const invoice = await Invoice.findOneAndUpdate({ _id: req.params.id, user: req.userId, status: 'draft' }, { $set: editable(req.body) }, { returnDocument: 'after', runValidators: true })
  if (!invoice) return res.status(404).json({ message: 'Editable draft not found' })
  res.json(invoice)
})
router.delete('/:id', creator, async (req, res) => {
  const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, user: req.userId, status: 'draft' })
  if (!invoice) return res.status(404).json({ message: 'Editable draft not found' })
  res.json({ message: 'Invoice deleted' })
})
router.post('/submit/:id', creator, async (req, res) => {
  if (!req.user.organizationId) return res.status(403).json({ message: 'Administrator must assign your organization before submission' })
  const invoice = await Invoice.findOneAndUpdate({ _id: req.params.id, user: req.userId, organizationId: req.user.organizationId, status: 'draft' }, { $set: { status: 'pending_manager' } }, { returnDocument: 'after', runValidators: true })
  if (!invoice) return res.status(404).json({ message: 'Submittable draft not found' })
  res.json({ message: 'Invoice submitted for approval', invoice })
})
for (const action of ['approve', 'reject']) {
  router.post(`/${action}/:id`, async (req, res) => {
    const scope = reviewScope(req.user)
    if (!scope) return res.status(403).json({ message: 'Assigned reviewer access required' })
    const update = action === 'approve'
      ? { $set: { status: nextStage[req.user.role] }, $push: { approvals: { role: req.user.role, approvedBy: req.user.username, date: new Date() } } }
      : { $set: { status: 'draft', approvals: [] } }
    // Include state in the atomic write to prevent duplicate approvals and skipped stages.
    const invoice = await Invoice.findOneAndUpdate({ ...scope, _id: req.params.id }, update, { returnDocument: 'after', runValidators: true })
    if (!invoice) return res.status(404).json({ message: 'Invoice not found at your approval stage' })
    res.json({ message: action === 'approve' ? 'Invoice approved' : 'Invoice returned to draft', invoice })
  })
}
module.exports = router
