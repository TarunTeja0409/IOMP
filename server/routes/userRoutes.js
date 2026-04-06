const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middlewares/authMiddleware');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');

const upload = multer({ storage: multer.memoryStorage() });

const KNOWN_SKILLS = [
  'react', 'node.js', 'express', 'mongodb', 'python', 'java', 'sql', 'javascript', 
  'html', 'css', 'tailwind', 'angular', 'vue', 'django', 'flask', 'spring', 'aws', 
  'docker', 'kubernetes', 'git', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 
  'typescript', 'machine learning', 'data analysis', 'agile', 'leadership', 
  'communication', 'teamwork', 'problem solving'
];

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { education, skills, preferredJobRole } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { education, skills, preferredJobRole },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/upload-resume', verifyToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileMime = req.file.mimetype;
    const allowedMimes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (!allowedMimes.includes(fileMime)) {
      return res.status(400).json({ message: 'Only PDF, DOCX, and TXT files are supported' });
    }

    let text = '';
    try {
      if (fileMime === 'application/pdf') {
        let parser;
        try {
          parser = new PDFParse({ data: req.file.buffer });
          const data = await parser.getText();
          text = data.text;
        } finally {
          if (parser) await parser.destroy();
        }
      } else if (fileMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        text = result.value;
      } else if (fileMime === 'text/plain') {
        text = req.file.buffer.toString('utf8');
      }
    } catch (err) {
      console.error('Parse Error:', err.message);
      return res.status(400).json({ message: 'The uploaded file is corrupted or could not be read.' });
    }
    
    // Convert to lowercase for skill matching but keep raw text for AI
    const lowerText = text.toLowerCase();

    const user = await User.findById(req.user.id);
    let extractedData = { skills: [], education: [], atsScore: 80, role: 'Professional' };

    // Use Gemini for advanced ATS parsing if API key is provided
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `Analyze this resume and extract information formatted exactly as raw JSON without markdown markers:
        {
          "skills": ["skill1", "skill2"],
          "education": ["Degree 1", "Degree 2"],
          "role": "Most relevant job role title",
          "atsScore": a number 1-100 indicating formatting, structure, clarity, and impact
        }
        Resume: ${text.substring(0, 5000)}`;
        
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        const responseText = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        extractedData = JSON.parse(responseText);
      } catch (aiErr) {
        console.error('Gemini extraction failed:', aiErr.message);
        // Fallback below
      }
    }

    // Fallback static parsing if AI fails:
    if (extractedData.skills.length === 0) {
      const extractedSkills = new Set();
      KNOWN_SKILLS.forEach(skill => {
        const safeSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(^|\\W)${safeSkill}(\\W|$)`, 'i');
        if (regex.test(lowerText)) extractedSkills.add(skill);
      });
      extractedData.skills = Array.from(extractedSkills);
    }

    const currSkillsLower = (user.skills || []).map(s => s.toLowerCase());
    let addedCount = 0;
    
    (extractedData.skills || []).forEach(skill => {
      if (!currSkillsLower.includes(skill.toLowerCase())) {
        user.skills.push(skill);
        addedCount++;
      }
    });

    // Save extracted skills and raw resume text for the AI Assistant
    user.resumeText = text;
    // Push robust history entry
    user.resumes.push({
      fileName: req.file.originalname || 'Automated_Upload.pdf',
      text: text,
      atsScore: extractedData.atsScore || 75,
      extractedRole: extractedData.role || ''
    });

    await user.save();
    
    res.json({ 
      message: `Resume parsed via AI! Analyzed ATS Score: ${extractedData.atsScore}/100. Appended ${addedCount} new skills to your profile.`, 
      foundSkills: extractedData.skills || [],
      extractedData: extractedData,
      user: user
    });
  } catch (error) {
    console.error('Server error during upload:', error);
    res.status(500).json({ message: error.message || 'Failed to process resume.' });
  }
});

module.exports = router;
