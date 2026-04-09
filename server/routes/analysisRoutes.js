const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const { verifyToken } = require('../middlewares/authMiddleware');

const COURSES_MAPPING = {
  'react': { name: 'React for Beginners', link: 'https://www.youtube.com/results?search_query=react+tutorial+for+beginners' },
  'node.js': { name: 'Node.js Crash Course', link: 'https://www.youtube.com/results?search_query=nodejs+crash+course' },
  'express': { name: 'Express.js Fundamentals', link: 'https://www.youtube.com/results?search_query=expressjs+tutorial' },
  'mongodb': { name: 'MongoDB Tutorial', link: 'https://www.youtube.com/results?search_query=mongodb+tutorial' },
  'python': { name: 'Python for Beginners', link: 'https://www.youtube.com/results?search_query=python+for+beginners' },
  'java': { name: 'Java Programming', link: 'https://www.youtube.com/results?search_query=java+programming+tutorial' },
  'javascript': { name: 'JavaScript Mastery', link: 'https://www.youtube.com/results?search_query=javascript+tutorial' },
  'css': { name: 'CSS & Tailwind', link: 'https://www.youtube.com/results?search_query=css+tailwind+tutorial' },
  'html': { name: 'HTML Basics', link: 'https://www.youtube.com/results?search_query=html+tutorial' },
};

// Analyse user skills against a specific job or general preferred role
router.post('/gap', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let requiredSkills = [];

    // Optional: Analyse against a specific job if jobId is provided
    if (req.body && req.body.jobId) {
      const job = await Job.findById(req.body.jobId);
      if (!job) return res.status(404).json({ message: 'Job not found' });
      requiredSkills = job.requiredSkills;
    } else {
      // Analyse against preferred role by aggregating required skills from jobs with similar titles
      const queryRole = user.preferredJobRole || '';
      if (!queryRole) return res.status(400).json({ message: 'Set a preferred job role first' });
      
      // Safely escape query constraint to prevent 500 Regex errors
      const safeQuery = queryRole.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const jobs = await Job.find({ title: new RegExp(safeQuery, 'i') });
      
      if (jobs.length === 0) {
        // Attempt dynamic generation via AI if no DB jobs found
        let aiGeneratedSkills = null;
        if (process.env.GEMINI_API_KEY) {
          try {
            const { GoogleGenAI } = require('@google/genai');
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const prompt = `Return a raw JSON array of 5 exact string names of the core technical skills required for the role "${queryRole}". Example: ["skill1", "skill2"]. Do not wrap in markdown or backticks, just the array brackets.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-lite', contents: prompt });
            const cleanResp = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
            aiGeneratedSkills = JSON.parse(cleanResp);
          } catch (aiErr) {
            console.error('Dynamic fallback failed:', aiErr.message);
          }
        }
        // Fallback to static lists mapped by basic keyword if AI fails
        if (aiGeneratedSkills && Array.isArray(aiGeneratedSkills) && aiGeneratedSkills.length > 0) {
          requiredSkills = aiGeneratedSkills;
        } else {
          const lRole = queryRole.toLowerCase();
          if (lRole.includes('data')) requiredSkills = ['python', 'sql', 'tableau', 'machine learning', 'excel'];
          else if (lRole.includes('backend') || lRole.includes('server')) requiredSkills = ['node.js', 'java', 'sql', 'docker', 'aws'];
          else if (lRole.includes('design') || lRole.includes('ui')) requiredSkills = ['figma', 'css', 'illustrator', 'ui design', 'prototyping'];
          else requiredSkills = ['javascript', 'html', 'css', 'react', 'node.js']; 
        }
      } else {
        const skillSet = new Set();
        jobs.forEach(job => {
          if (Array.isArray(job.requiredSkills)) {
            job.requiredSkills.forEach(s => {
              if (s) skillSet.add(s.toLowerCase());
            });
          }
        });
        requiredSkills = Array.from(skillSet);
      }
    }

    const userSkills = Array.isArray(user.skills) 
      ? user.skills.filter(Boolean).map(s => String(s).toLowerCase()) 
      : [];
    const requiredSkillsLower = Array.isArray(requiredSkills)
      ? requiredSkills.filter(Boolean).map(s => String(s).toLowerCase())
      : [];

    const matchingSkills = requiredSkillsLower.filter(s => userSkills.includes(s));
    const missingSkills = requiredSkillsLower.filter(s => !userSkills.includes(s));

    const score = requiredSkillsLower.length > 0 
      ? Math.round((matchingSkills.length / requiredSkillsLower.length) * 100) 
      : 100;

    // Generate learning recommendations based on missing skills
    const recommendations = missingSkills.map(skill => {
      const course = COURSES_MAPPING[skill] || {
        name: `Learn ${skill.charAt(0).toUpperCase() + skill.slice(1)}`,
        link: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill)}+tutorial`
      };
      return { skill, course };
    });

    res.json({
      score,
      matchingSkills,
      missingSkills,
      recommendations
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error: ${error.message}`, stack: error.stack });
  }
});

// Recommend top jobs based on user profile
router.get('/recommended-jobs', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userSkills = user.skills.map(s => s.toLowerCase());
    // Get all jobs and score them
    const jobs = await Job.find().populate('employerId', 'name email');
    
    const scoredJobs = jobs.map(job => {
      const required = job.requiredSkills.map(s => s.toLowerCase());
      const matching = required.filter(s => userSkills.includes(s));
      const score = required.length > 0 ? (matching.length / required.length) * 100 : 0;
      return { job, score };
    });

    // Sort by score descending and take top 5
    scoredJobs.sort((a, b) => b.score - a.score);
    const topJobs = scoredJobs.slice(0, 5).filter(j => j.score > 0 || userSkills.length === 0);

    res.json(topJobs.map(j => ({ ...j.job.toObject(), matchScore: Math.round(j.score) })));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
