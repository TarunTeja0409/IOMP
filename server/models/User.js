const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Job Seeker', 'Employer', 'Admin'], 
    default: 'Job Seeker' 
  },
  education: {
    type: [{ type: String }],
    default: []
  },
  skills: {
    type: [{ type: String }],
    default: []
  },
  preferredJobRole: {
    type: String,
    default: ''
  },
  resumeText: {
    type: String,
    default: ''
  },
  resumes: [{
    fileName: String,
    text: String,
    atsScore: Number,
    extractedRole: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
