const express = require('express')
const router = express.Router()
const Invoice = require('../models/Invoice')
const { authMiddleware } = require('./auth')

// GET - get all invoices for logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.userId })
      .sort({ createdAt: -1 })
    res.json(invoices)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET - get single invoice
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
    res.json(invoice)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST - create new invoice
router.post('/', authMiddleware, async (req, res) => {
  try {
    const invoice = new Invoice({
      ...req.body,
      user: req.userId
    })
    await invoice.save()
    res.json(invoice)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PUT - update invoice
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    res.json(invoice)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE - delete invoice
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id)
    res.json({ message: 'Invoice deleted!' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router