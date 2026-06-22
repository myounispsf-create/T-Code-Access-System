const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  role: {
  type: String,
  enum: ['creator', 'manager', 'finance', 'director'],
  default: 'creator'
}
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)