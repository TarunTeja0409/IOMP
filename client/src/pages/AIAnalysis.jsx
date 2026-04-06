import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/axios';
import { Bot, Sparkles, Send, PlayCircle, AlertCircle, CheckCircle2, UploadCloud } from 'lucide-react';
import SkillGap3D from '../components/SkillGap3D';
import { useAuthStore } from '../store/authStore';

const AIAnalysis = () => {
  const fetchProfile = useAuthStore(state => state.fetchProfile);
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a Target Job Description first.');
      return;
    }
    
    setError('');
    setLoading(true);
    setAnalysis(null);
    
    try {
      // Step 1: Upload and Parse File (if selected)
      if (file) {
        setStatusText('Parsing attached resume...');
        const formData = new FormData();
        formData.append('resume', file);
        await api.post('/user/upload-resume', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        await fetchProfile(); // Update frontend user context with new skills/resume text
      }

      // Step 2: Run AI Analysis
      setStatusText('Analyzing Resume against Job Description...');
      const res = await api.post('/ai/ai-gap', { jobDescription });
      setAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Wait, failed to analyze gap. Ensure the file is valid and API keys are set.');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-primary-500/10 rounded-2xl mb-4 text-primary-400">
          <Bot className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">AI Resume & Job Matcher</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Upload your latest resume and paste the target job description to get instant, deep AI Analysis on your skill gaps.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Input Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 p-6 md:p-8 rounded-3xl border border-slate-700/50 backdrop-blur-xl shadow-2xl relative overflow-hidden flex flex-col"
        >
          {/* File Upload Area */}
          <div className="mb-6">
             <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              1. Attach Resume <UploadCloud className="text-primary-400 w-5 h-5" />
            </h2>
            <div className="relative border-2 border-dashed border-slate-600 hover:border-primary-500 rounded-2xl p-6 transition-all text-center group cursor-pointer bg-slate-900/50">
              <input 
                type="file" 
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={loading}
              />
              <UploadCloud className="w-10 h-10 mx-auto mb-3 text-slate-500 group-hover:text-primary-400 transition-colors" />
              <p className="text-slate-300 font-medium">{file ? file.name : "Drag & Drop or Click to Upload"}</p>
              <p className="text-slate-500 text-xs mt-1">Supports PDF, DOCX, TXT. (Optional if already uploaded)</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            2. Target Job Description <Sparkles className="text-primary-400 w-5 h-5" />
          </h2>
          
          <textarea 
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none transition-all placeholder:text-slate-500 mb-6"
            placeholder="Paste the details of the job you want to apply for..."
            disabled={loading}
          />
          
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          
          <button 
            onClick={handleAnalyze}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              loading ? 'bg-primary-500/50 text-white cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg lg:shadow-primary-500/25'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                 <Bot className="animate-bounce" /> {statusText || 'Processing...'}
              </span>
            ) : (
               <span className="flex items-center gap-2">
                 Run Deep AI Analysis <Send className="w-4 h-4 ml-2" />
               </span>
            )}
          </button>
        </motion.div>

        {/* Results Panel */}
        {analysis ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-6"
          >
             <div className="bg-primary-900/20 border border-primary-500/30 p-6 rounded-3xl backdrop-blur-xl">
                <p className="text-primary-100 italic leading-relaxed text-lg border-l-4 border-primary-500 pl-4 mb-4">
                  "{analysis.summary}"
                </p>
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">ATS Architecture Score</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${analysis.atsScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : analysis.atsScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                      {analysis.atsScore}/100
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {analysis.atsFeedback || "No ATS feedback provided."}
                  </p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-900/20 border border-emerald-500/20 p-5 rounded-2xl">
                  <h3 className="text-emerald-400 flex items-center gap-2 mb-2 font-semibold">
                    <CheckCircle2 className="w-5 h-5"/> Verified Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matchingSkills.map((s, i) => (
                      <span key={i} className="text-xs bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded-md border border-emerald-500/20">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-900/20 border border-amber-500/20 p-5 rounded-2xl">
                  <h3 className="text-amber-400 flex items-center gap-2 mb-2 font-semibold">
                    <AlertCircle className="w-5 h-5"/> Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSkills.map((s, i) => (
                      <span key={i} className="text-xs bg-amber-500/10 text-amber-300 px-2 py-1 rounded-md border border-amber-500/20">{s}</span>
                    ))}
                  </div>
                </div>
             </div>

             <div>
                <h3 className="text-xl font-semibold text-white mb-4">Recommended Training</h3>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, i) => (
                    <a 
                      key={i} 
                      href={rec.course.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group bg-slate-800/80 hover:bg-primary-900/40 border border-slate-700 hover:border-primary-500/50 p-4 rounded-xl flex items-center justify-between transition-all"
                    >
                      <div>
                        <p className="text-white font-medium group-hover:text-primary-400 transition-colors">{rec.course.name}</p>
                        <p className="text-slate-400 text-sm mt-1">Found missing: {rec.skill}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-6 h-6" />
                      </div>
                    </a>
                  ))}
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:flex bg-slate-800/20 border border-slate-700/50 border-dashed rounded-3xl h-full items-center justify-center flex-col text-slate-500"
          >
             <Bot className="w-16 h-16 mb-4 opacity-50" />
             <p>Awaiting Job Description text...</p>
          </motion.div>
        )}
      </div>

      {analysis && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-slate-900/50 p-6 rounded-3xl border border-slate-800"
        >
          <h3 className="text-center text-slate-300 font-medium mb-6">3D Graph Overview</h3>
          <div className="h-[400px]">
            <SkillGap3D analysis={analysis} preferredJobRole="Target Role" />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AIAnalysis;
