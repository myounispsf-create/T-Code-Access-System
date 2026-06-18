const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const SECRET = process.env.JWT_SECRET

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'No token!' })
  }
  try {
    const decoded = jwt.verify(token, SECRET)
    req.userId = decoded.id
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid token!' })
  }
}

router.post('/register', async (req, res) => {
  try {
    const existingUser = await User.findOne({ 
      username: req.body.username 
    })
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Username already exists!' 
      })
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
      companyName: req.body.companyName
    })
    await user.save()
    res.json({ message: 'User registered successfully! ✅' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ 
      username: req.body.username 
    })
    if (!user) {
      return res.status(400).json({ message: 'User not found!' })
    }
    const isMatch = await bcrypt.compare(
      req.body.password, 
      user.password
    )
    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong password!' })
    }
    const token = jwt.sign({ id: user._id }, SECRET, { 
      expiresIn: '1d' 
    })
    res.json({ 
      token, 
      username: user.username,
      companyName: user.companyName
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = { router, authMiddleware }