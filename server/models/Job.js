const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requiredSkills: { type: [{ type: String }], required: true },
  qualifications: { type: [{ type: String }], required: true },
  location: { type: String, required: true },
  jobType: { type: String, enum: ['Government', 'Private'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
