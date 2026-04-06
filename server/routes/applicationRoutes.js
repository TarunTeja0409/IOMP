const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Job Seeker applies to a job
router.post('/', verifyToken, verifyRole(['Job Seeker']), async (req, res) => {
  try {
    const { jobId } = req.body;
    
    // Check if already applied
    const existing = await Application.findOne({ userId: req.user.id, jobId });
    if (existing) return res.status(400).json({ message: 'Already applied to this job' });

    const newApp = new Application({
      userId: req.user.id,
      jobId
    });
    await newApp.save();
    res.status(201).json(newApp);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User gets their applications
router.get('/my-applications', verifyToken, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id }).populate('jobId');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
