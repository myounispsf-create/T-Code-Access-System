const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const { router: authRoutes } = require('./routes/auth')
const invoiceRoutes = require('./routes/Invoices')
const app = express()
const PORT = process.env.PORT || 5000

// Fix CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204)
  }
  next()
})

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/invoices', invoiceRoutes)

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.log('❌ MongoDB Error:', err))

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})