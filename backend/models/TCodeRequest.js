const mongoose = require('mongoose')
const tcodeRequestSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  requestNumber: { type: String, required: true, trim: true, maxlength: 100 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterName: { type: String, required: true, trim: true, maxlength: 200 },
  sapUserId: { type: String, required: true, trim: true, maxlength: 100 },
  department: { type: String, trim: true, maxlength: 200 },
  sapSystem: { type: String, required: true, trim: true, maxlength: 100 },
  sapClient: { type: String, required: true, match: /^\d{3}$/ },
  businessJustification: { type: String, required: true, trim: true, maxlength: 4000 },
  accessType: { type: String, enum: ['temporary', 'ongoing'], default: 'temporary' },
  validFrom: { type: Date, required: true },
  validUntil: Date,
  tcodes: { type: [{ type: String, trim: true, uppercase: true, maxlength: 40 }],
    validate: { validator: codes => codes.length > 0 && codes.length <= 100 && codes.every(code => /^[A-Z0-9_\/]+$/.test(code)), message: 'Provide 1–100 valid T-codes' } },
  status: { type: String, enum: ['draft', 'pending_manager', 'pending_finance', 'pending_director', 'approved'], default: 'draft' },
  approvals: [{ role: String, approvedBy: String, date: { type: Date, default: Date.now } }]
}, { timestamps: true, collection: 'tcode_requests' })
tcodeRequestSchema.index({ user: 1, requestNumber: 1 }, { unique: true })
tcodeRequestSchema.pre('validate', function () {
  if (this.accessType === 'temporary' && !this.validUntil) this.invalidate('validUntil', 'Temporary access needs an end date')
  if (this.validUntil && this.validFrom && this.validUntil < this.validFrom) this.invalidate('validUntil', 'End date must follow start date')
})
module.exports = mongoose.model('TCodeRequest', tcodeRequestSchema)
