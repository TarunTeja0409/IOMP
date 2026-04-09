const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middlewares/authMiddleware');
const { GoogleGenAI } = require('@google/genai');

let ai;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } else {
    console.warn("GEMINI_API_KEY is missing in environment variables.");
  }
} catch (e) {
  console.error("Gemini AI SDK failed to initialize:", e.message);
}

router.post('/ai-gap', verifyToken, async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ message: 'Job description is required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const resumeText = user.resumeText || user.skills.join(', ');

    // Provide a mocked response if there's no API key
      if (!process.env.GEMINI_API_KEY) {
        console.warn("No GEMINI_API_KEY found. Sending mocked AI response.");
        return res.json({
           matchScore: 65,
           atsScore: 72,
           atsFeedback: "Your layout relies on standard indentation but lacks sharp action verbs. (This is a mock response because the GEMINI_API_KEY is missing).",
           matchingSkills: ['React', 'JavaScript', 'HTML'],
           missingSkills: ['Node.js', 'Express', 'MongoDB'],
         recommendations: [
           { skill: 'Node.js', course: { name: 'Node.js Complete Guide', link: 'https://www.youtube.com/results?search_query=nodejs+crash+course' } },
           { skill: 'MongoDB', course: { name: 'MongoDB Fundamentals', link: 'https://www.youtube.com/results?search_query=mongodb+tutorial' } }
         ],
         summary: "This is a strictly mocked AI response since the API Key is missing. Please add GEMINI_API_KEY to your .env file."
      });
    }

    const prompt = `
      You are an expert HR AI Assistant. 
      Analyze the following candidate's resume text against the provided job description.
      
      Job Description:
      "${jobDescription}"
      
      Candidate's Resume Text:
      "${resumeText}"
      
      Return ONLY a raw JSON object string with the following EXACT structure:
      {
        "matchScore": <number between 0-100 indicating percentage of match>,
        "atsScore": <number between 0-100 evaluating the raw formatting, impact, readability, and structural ATS-compliance of the resume independent of the job>,
        "atsFeedback": "2-3 highly critical sentences explaining exactly how their resume looks, what structurally is good or bad about it, and if it passes standard ATS parsers easily.",
        "matchingSkills": ["skill1", "skill2"],
        "missingSkills": ["important skill they lack 1", "important skill they lack 2"],
        "recommendations": [
          { "skill": "missing skill name", "course": { "name": "A catchy real youtube video title", "link": "https://www.youtube.com/results?search_query=<search query for video>" } }
        ],
        "summary": "1-2 sentences summarizing the candidate's fit."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });

    let rawJson = response.text || '';
    
    // Robust extraction: Locate the first { and last }
    const firstBrace = rawJson.indexOf('{');
    const lastBrace = rawJson.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error(`AI returned invalid format: ${rawJson}`);
    }
    
    const jsonString = rawJson.substring(firstBrace, lastBrace + 1);
    const parsedData = JSON.parse(jsonString);
    res.json(parsedData);

  } catch (error) {
    if (error.message && (error.message.includes('429') || error.message.includes('503') || error.message.includes('UNAVAILABLE'))) {
       console.warn('Gemini AI Rate Limit Hit! Sending mocked fallback.');
       return res.json({
         matchScore: 65,
         atsScore: 72,
         atsFeedback: "Your layout relies on standard indentation but lacks sharp action verbs. (This is a mock response because the GEMINI API rate limit was exceeded).",
         matchingSkills: ['React', 'JavaScript', 'HTML'],
         missingSkills: ['Node.js', 'Express', 'MongoDB'],
         recommendations: [
           { skill: 'Node.js', course: { name: 'Node.js Complete Guide', link: 'https://www.youtube.com/results?search_query=nodejs+crash+course' } },
           { skill: 'MongoDB', course: { name: 'MongoDB Fundamentals', link: 'https://www.youtube.com/results?search_query=mongodb+tutorial' } }
         ],
         summary: "This is a strictly mocked AI response since the Google API Free-Tier Rate Limit was momentarily exceeded. Please wait 15 seconds to try again for a real analysis."
       });
    }
    
    console.error('AI Analysis Error:', error.message || error);
    res.status(500).json({ message: `AI Analysis Failed: ${error.message || 'Unknown Error'}` });
  }
});

module.exports = router;
