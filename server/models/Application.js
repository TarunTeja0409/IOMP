const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: { type: String, enum: ['Applied', 'Reviewed', 'Accepted', 'Rejected'], default: 'Applied' },
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
