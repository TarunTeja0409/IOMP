const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const filters = {};
    if (req.query.location) filters.location = new RegExp(req.query.location, 'i');
    if (req.query.jobType) filters.jobType = req.query.jobType;
    
    // Simple text search on title
    if (req.query.search) {
      filters.title = new RegExp(req.query.search, 'i');
    }

    const jobs = await Job.find(filters).populate('employerId', 'name email');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch REAL TIME LIVE jobs from external Jobicy API
router.get('/realtime', async (req, res) => {
  try {
    const KNOWN_SKILLS = [
      'react', 'node', 'express', 'mongodb', 'python', 'java', 'sql', 'javascript',
      'typescript', 'aws', 'docker', 'kubernetes', 'html', 'css', 'tailwind', 'go',
      'django', 'flask', 'machine learning', 'data analysis', 'vue', 'angular'
    ];

    const response = await fetch('https://jobicy.com/api/v2/remote-jobs?count=15');
    if (!response.ok) throw new Error('External API Failed');
    
    const data = await response.json();
    const liveJobs = (data.jobs || []).map(j => {
      // Intelligently string match to figure out required skills from unstructured HTML descriptions
      const strippedDesc = (j.jobDescription || j.jobExcerpt || '').toLowerCase();
      const extractedSkills = KNOWN_SKILLS.filter(skill => strippedDesc.includes(skill.toLowerCase()));

      return {
        _id: 'api_' + j.id,
        title: j.jobTitle,
        company: j.companyName,
        location: j.jobGeo || 'Global',
        roleType: j.jobType || 'Remote',
        requiredSkills: extractedSkills.length > 0 ? extractedSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)) : ['Technical Skills'],
        salary: (j.annualSalaryMin && j.annualSalaryMax) ? `$${j.annualSalaryMin/1000}k - $${j.annualSalaryMax/1000}k` : 'Competitive',
        description: j.jobExcerpt ? j.jobExcerpt.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...' : 'Review external listing for full details.',
        link: j.url
      };
    });

    res.json(liveJobs);
  } catch (error) {
    console.error('Realtime API fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch live jobs' });
  }
});

// Employer posts a job
router.post('/', verifyToken, verifyRole(['Employer', 'Admin']), async (req, res) => {
  try {
    const { title, description, requiredSkills, qualifications, location, jobType } = req.body;
    const newJob = new Job({
      title,
      description,
      employerId: req.user.id,
      requiredSkills,
      qualifications,
      location,
      jobType
    });
    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
