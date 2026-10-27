const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../models/User')
const router = express.Router()
const roles = ['creator', 'manager', 'finance', 'director']
async function authMiddleware(req, res, next) {
  const match = /^Bearer ([^\s]+)$/i.exec(req.headers.authorization || '')
  if (!match) return res.status(401).json({ message: 'Authentication required' })
  let decoded
  try {
    decoded = jwt.verify(match[1], process.env.JWT_SECRET, { algorithms: ['HS256'] })
    if (!mongoose.isObjectIdOrHexString(decoded.id)) throw new Error('Invalid identity')
  } catch { return res.status(401).json({ message: 'Invalid or expired token' }) }
  try {
    const user = await User.findById(decoded.id)
    if (!user || !roles.includes(user.role)) return res.status(401).json({ message: 'Account unavailable' })
    req.user = user; req.userId = String(user._id); next()
  } catch (error) { next(error) }
}
function credentials(body, registration = false) {
  return body && typeof body.username === 'string' && body.username.trim().length > 0 && body.username.length <= 100 &&
    typeof body.password === 'string' && Buffer.byteLength(body.password) <= 72 && body.password.length >= (registration ? 8 : 1) &&
    (!registration || (typeof body.companyName === 'string' && body.companyName.trim().length > 0 && body.companyName.length <= 200))
}
router.post('/register', async (req, res) => {
  if (!credentials(req.body, true)) return res.status(400).json({ message: 'Provide username, company name and an 8+ character password (max 72 bytes)' })
  const username = req.body.username.trim()
  if (await User.findOne({ username })) return res.status(409).json({ message: 'Username already exists' })
  await User.create({ username, password: await bcrypt.hash(req.body.password, 10), companyName: req.body.companyName.trim(), role: 'creator' })
  res.status(201).json({ message: 'Account created. Approval access is assigned by your administrator.' })
})
router.post('/login', async (req, res) => {
  if (!credentials(req.body)) return res.status(400).json({ message: 'Invalid credentials' })
  const user = await User.findOne({ username: req.body.username.trim() })
  if (!user || !await bcrypt.compare(req.body.password, user.password)) return res.status(401).json({ message: 'Invalid credentials' })
  const token = jwt.sign({ id: String(user._id) }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1d' })
  res.json({ token, username: user.username, companyName: user.companyName, role: user.role })
})
module.exports = { router, authMiddleware }
