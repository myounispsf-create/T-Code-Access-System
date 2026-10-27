const express = require('express')
const mongoose = require('mongoose')
const TCodeRequest = require('../models/TCodeRequest')
const { authMiddleware } = require('./auth')
const router = express.Router()
const stages = { manager: 'pending_manager', finance: 'pending_finance', director: 'pending_director' }
const nextStage = { manager: 'pending_finance', finance: 'pending_director', director: 'approved' }
const fields = ['requestNumber', 'requesterName', 'sapUserId', 'department', 'sapSystem', 'sapClient', 'businessJustification', 'accessType', 'validFrom', 'validUntil', 'tcodes']
function editable(body) {
  const data = {}
  for (const field of fields) if (Object.hasOwn(body || {}, field)) data[field] = body[field]
  return data
}
function reviewScope(user) {
  if (!stages[user.role] || !user.organizationId) return null
  return { organizationId: user.organizationId, status: stages[user.role], user: { $ne: user._id } }
}
router.use(authMiddleware)
router.param('id', (req, res, next, id) => {
  if (!mongoose.isObjectIdOrHexString(id)) return res.status(400).json({ message: 'Invalid request ID' })
  next()
})
function creator(req, res, next) {
  if (req.user.role !== 'creator') return res.status(403).json({ message: 'Creator access required' })
  next()
}
router.get('/', async (req, res) => {
  const scope = req.user.role === 'creator' ? { user: req.userId } : reviewScope(req.user)
  res.json(scope ? await TCodeRequest.find(scope).sort({ createdAt: -1 }) : [])
})
router.get('/:id', async (req, res) => {
  const scope = req.user.role === 'creator' ? { user: req.userId } : reviewScope(req.user)
  const request = scope && await TCodeRequest.findOne({ ...scope, _id: req.params.id })
  if (!request) return res.status(404).json({ message: 'Request not found' })
  res.json(request)
})
router.post('/', creator, async (req, res) => {
  const request = await TCodeRequest.create({ ...editable(req.body), user: req.userId, organizationId: req.user.organizationId || null, status: 'draft', approvals: [] })
  res.status(201).json(request)
})
router.put('/:id', creator, async (req, res) => {
  const filter = { _id: req.params.id, user: req.userId, status: 'draft' }
  const existing = await TCodeRequest.findOne(filter)
  if (!existing) return res.status(404).json({ message: 'Editable draft not found' })
  const content = editable(req.body)
  existing.set(content)
  await existing.validate()
  const request = await TCodeRequest.findOneAndUpdate({ ...filter, __v: existing.__v }, { $set: content, $inc: { __v: 1 } }, { returnDocument: 'after', runValidators: true })
  if (!request) return res.status(404).json({ message: 'Editable draft not found' })
  res.json(request)
})
router.delete('/:id', creator, async (req, res) => {
  const request = await TCodeRequest.findOneAndDelete({ _id: req.params.id, user: req.userId, status: 'draft' })
  if (!request) return res.status(404).json({ message: 'Editable draft not found' })
  res.json({ message: 'Request deleted' })
})
router.post('/submit/:id', creator, async (req, res) => {
  if (!req.user.organizationId) return res.status(403).json({ message: 'Administrator must assign your organization before submission' })
  const request = await TCodeRequest.findOneAndUpdate({ _id: req.params.id, user: req.userId, organizationId: req.user.organizationId, status: 'draft' }, { $set: { status: 'pending_manager' } }, { returnDocument: 'after', runValidators: true })
  if (!request) return res.status(404).json({ message: 'Submittable draft not found' })
  res.json({ message: 'Request submitted for approval', request })
})
for (const action of ['approve', 'reject']) {
  router.post(`/${action}/:id`, async (req, res) => {
    const scope = reviewScope(req.user)
    if (!scope) return res.status(403).json({ message: 'Assigned reviewer access required' })
    const update = action === 'approve'
      ? { $set: { status: nextStage[req.user.role] }, $push: { approvals: { role: req.user.role, approvedBy: req.user.username, date: new Date() } } }
      : { $set: { status: 'draft', approvals: [] } }
    // Include state in the atomic write to prevent duplicate approvals and skipped stages.
    const request = await TCodeRequest.findOneAndUpdate({ ...scope, _id: req.params.id }, update, { returnDocument: 'after', runValidators: true })
    if (!request) return res.status(404).json({ message: 'Request not found at your approval stage' })
    res.json({ message: action === 'approve' ? 'Request approved' : 'Request returned to draft', request })
  })
}
module.exports = router
