require('dotenv').config()
const mongoose = require('mongoose')
const { createApp } = require('./app')
async function start() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('Set MONGO_URI and a JWT_SECRET of at least 32 characters')
  const app = createApp()
  await mongoose.connect(process.env.MONGO_URI)
  app.listen(process.env.PORT || 5000, () => console.log('T-Code Access API ready'))
}
if (require.main === module) start().catch(() => {
  console.error('API startup failed; check database connectivity and environment configuration')
  process.exitCode = 1
})
module.exports = { start }
