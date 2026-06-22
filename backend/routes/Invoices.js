const express = require('express')
const router = express.Router()
const Invoice = require('../models/Invoice')
const { authMiddleware } = require('./auth')

// GET - get all invoices for logged in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.userId)
    let invoices

   if (user.role === 'creator') {
  // Creator sees ALL his invoices with any status
  invoices = await Invoice.find({ 
    user: req.userId
  }).sort({ createdAt: -1 })
    } else if (user.role === 'manager') {
      // Manager sees invoices pending his approval
      invoices = await Invoice.find({ 
        status: 'pending_manager'
      }).sort({ createdAt: -1 })
    } else if (user.role === 'finance') {
      // Finance sees invoices pending his approval
      invoices = await Invoice.find({ 
        status: 'pending_finance'
      }).sort({ createdAt: -1 })
    } else if (user.role === 'director') {
      // Director sees invoices pending his approval
      invoices = await Invoice.find({ 
        status: 'pending_director'
      }).sort({ createdAt: -1 })
    }

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

// POST - submit invoice for approval
router.post('/submit/:id', authMiddleware, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
    if (invoice.status !== 'draft') {
      return res.status(400).json({ message: 'Invoice already submitted!' })
    }
    invoice.status = 'pending_manager'
    await invoice.save()
    res.json({ message: 'Invoice submitted for approval! ✅', invoice })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST - approve invoice
router.post('/approve/:id', authMiddleware, async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.userId)
    const invoice = await Invoice.findById(req.params.id)

    // Check correct role is approving
    if (user.role === 'manager' && invoice.status === 'pending_manager') {
      invoice.status = 'pending_finance'
      invoice.approvals.push({
        role: 'manager',
        approvedBy: user.username,
        date: new Date()
      })
    } else if (user.role === 'finance' && invoice.status === 'pending_finance') {
      invoice.status = 'pending_director'
      invoice.approvals.push({
        role: 'finance',
        approvedBy: user.username,
        date: new Date()
      })
    } else if (user.role === 'director' && invoice.status === 'pending_director') {
      invoice.status = 'approved'
      invoice.approvals.push({
        role: 'director',
        approvedBy: user.username,
        date: new Date()
      })
    } else {
      return res.status(400).json({ message: 'You cannot approve this invoice!' })
    }

    await invoice.save()
    res.json({ message: 'Invoice approved! ✅', invoice })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST - reject invoice
router.post('/reject/:id', authMiddleware, async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.userId)
    const invoice = await Invoice.findById(req.params.id)

    // Check correct role is rejecting
    if (
      (user.role === 'manager' && invoice.status === 'pending_manager') ||
      (user.role === 'finance' && invoice.status === 'pending_finance') ||
      (user.role === 'director' && invoice.status === 'pending_director')
    ) {
      invoice.status = 'draft'    // send back to creator
      invoice.approvals = []      // clear all approvals
      await invoice.save()
      res.json({ message: 'Invoice rejected! ❌', invoice })
    } else {
      return res.status(400).json({ message: 'You cannot reject this invoice!' })
    }
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router