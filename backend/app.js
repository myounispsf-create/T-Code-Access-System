const express = require('express')
const cors = require('cors')
function createApp() {
  const app = express()
  app.disable('x-powered-by')
  const origins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map(s => s.trim()).filter(Boolean)
  if (origins.includes('*')) throw new Error('Explicit CORS origins required')
  app.use(cors({
    origin(origin, cb) {
      if (!origin || origins.includes(origin)) return cb(null, true)
      const error = new Error('Origin not allowed'); error.status = 403; cb(error)
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }))
  app.use(express.json({ limit: '100kb' }))
  app.get('/health', (req, res) => res.json({ status: 'ok' }))
  app.use('/api/auth', require('./routes/auth').router)
  app.use('/api/invoices', require('./routes/Invoices'))
  app.use((err, req, res, next) => {
    if (err.code === 11000) return res.status(409).json({ message: 'Record already exists' })
    if (['ValidationError', 'CastError'].includes(err.name) || err.status === 400) return res.status(400).json({ message: 'Invalid request data' })
    const status = [403, 413].includes(err.status) ? err.status : 500
    if (status === 500) console.error('Request failed:', err.name)
    res.status(status).json({ message: status === 403 ? 'Origin not allowed' : status === 413 ? 'Request too large' : 'Server error' })
  })
  return app
}
module.exports = { createApp }
