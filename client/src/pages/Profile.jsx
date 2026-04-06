import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { UserCircle, Briefcase, GraduationCap, Code2, Save, CheckCircle, Mail, Award, FileText, UploadCloud, RefreshCw, Star, Clock } from 'lucide-react';

const Profile = () => {
  const { user, fetchProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    preferredJobRole: '',
    education: '',
    skills: ''
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  
  // AI Resume State
  const [uploading, setUploading] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        preferredJobRole: user.preferredJobRole || '',
        education: user.education?.join(', ') || '',
        skills: user.skills?.join(', ') || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        preferredJobRole: formData.preferredJobRole,
        education: formData.education.split(',').map(s => s.trim()).filter(Boolean),
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      };
      await api.put('/user/profile', payload);
      await fetchProfile();
      setMessage('Profile secured and updated!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setResumeMessage('');
    const formDataFile = new FormData();
    formDataFile.append('resume', file);

    try {
      const res = await api.post('/user/upload-resume', formDataFile, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResumeMessage(res.data.message);
      
      // Combine Data! (User requested combining, not overwriting)
      const data = res.data.extractedData;
      setFormData(prev => {
        const combine = (existing, newArr) => {
          const eArr = existing.split(',').map(s => s.trim()).filter(Boolean);
          const merged = Array.from(new Set([...eArr, ...(newArr || [])]));
          return merged.join(', ');
        };

        return {
          preferredJobRole: data?.role || prev.preferredJobRole,
          education: combine(prev.education, data?.education),
          skills: combine(prev.skills, data?.skills)
        };
      });
      
      await fetchProfile(); // Update user to load the newly stored resume array
    } catch (error) {
      setResumeMessage(error.response?.data?.message || 'Failed to analyze resume via AI.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Architect Your Profile</h1>
          <p className="text-slate-400">Curate your identity with our Gemini AI autofill logic.</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Identity & Resume Library */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          className="lg:col-span-1 space-y-8"
        >
          {/* Identity Core */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-xl flex flex-col items-center relative overflow-hidden">
             <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"></div>
             
             <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-full flex items-center justify-center p-1 mb-4 shadow-xl shadow-primary-500/20">
               <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                 <UserCircle className="w-12 h-12 text-primary-400" />
               </div>
             </div>
             <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
             <span className="text-xs font-semibold px-3 py-1 bg-primary-500/10 text-primary-400 rounded-full border border-primary-500/20 uppercase tracking-widest">{user.role}</span>
             
             <div className="w-full mt-6 space-y-4">
                <div className="flex items-center gap-3 text-slate-300 text-sm bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {user.email}
                </div>
                <div className="flex items-center gap-3 text-slate-300 text-sm bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                  <Award className="w-4 h-4 text-emerald-500" />
                  {user.skills?.length || 0} Verified Skills
                </div>
             </div>
          </div>

          {/* AI Resume Upload & Library */}
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-xl relative group">
             <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
               <FileText className="text-primary-400 w-5 h-5" /> AI Resume Engine
             </h3>
             <p className="text-slate-400 text-xs mb-6 leading-relaxed">
               Upload your resume. Our Gemini AI will evaluate its structural ATS score out of 100 and intelligently combine your extracted skills with your manual profile.
             </p>

             <div 
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all group-hover:border-primary-500/50 bg-slate-900/50 mb-6 ${uploading ? 'opacity-50 cursor-not-allowed border-slate-700' : 'cursor-pointer hover:bg-primary-900/10 border-slate-600'}`}
              >
                {uploading ? (
                  <RefreshCw className="w-8 h-8 text-primary-500 animate-spin mb-3" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-primary-400 mb-3 transition-colors" />
                )}
                <span className="text-slate-300 font-medium text-sm text-center">
                  {uploading ? 'AI Analyzing Resume...' : 'Upload PDF/DOCX to Autofill'}
                </span>
                <input type="file" accept=".pdf,.docx,.txt" className="hidden" ref={fileInputRef} onChange={handleFileUpload} disabled={uploading}/>
              </div>

              {resumeMessage && (
                <div className={`mb-6 p-3 rounded-lg text-xs flex items-start gap-2 ${resumeMessage.includes('Failed') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-primary-500/10 text-primary-300 border border-primary-500/20'}`}>
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> <p className="leading-relaxed">{resumeMessage}</p>
                </div>
              )}

              {/* Resume Library Rendering */}
              {user.resumes && user.resumes.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Document Library</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {user.resumes.slice().reverse().map((r, i) => (
                      <div key={i} className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden">
                        <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-primary-400 to-indigo-600 opacity-50"></div>
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-white font-medium truncate max-w-[150px]">{r.fileName}</p>
                          <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.atsScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : r.atsScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                            {r.atsScore} ATS
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(r.uploadedAt).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3"/> {r.extractedRole || 'General'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </motion.div>

        {/* Right Column: Editable Modules */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${message.includes('updated') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              <CheckCircle className="w-5 h-5" /> {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Module: Role */}
            <div className="bg-slate-800/40 border border-slate-700/50 p-6 sm:p-8 rounded-3xl backdrop-blur-xl group hover:border-primary-500/30 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary-400" /> Target Job Role
              </h3>
              <input 
                type="text" 
                placeholder="e.g. Senior Frontend Engineer"
                value={formData.preferredJobRole}
                onChange={(e) => setFormData({...formData, preferredJobRole: e.target.value})}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-medium placeholder:text-slate-600"
              />
            </div>

            {/* Module: Education */}
            <div className="bg-slate-800/40 border border-slate-700/50 p-6 sm:p-8 rounded-3xl backdrop-blur-xl group hover:border-primary-500/30 transition-colors">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary-400" /> Academic Background <span className="text-xs text-slate-500 font-normal ml-2">(comma separated)</span>
              </h3>
              <input 
                type="text" 
                placeholder="e.g. B.S. Computer Science, M.S. Data Analytics"
                value={formData.education}
                onChange={(e) => setFormData({...formData, education: e.target.value})}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Module: Skills */}
            <div className="bg-slate-800/40 border border-slate-700/50 p-6 sm:p-8 rounded-3xl backdrop-blur-xl group hover:border-primary-500/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary-400" /> Core Competencies
                </h3>
                <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded-md">Comma Separated</span>
              </div>
              <textarea 
                placeholder="e.g. React, Node.js, Python, AWS, Docker"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all min-h-[120px] resize-none placeholder:text-slate-600 leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={saving}
                className="bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl px-8 py-4 transition-all shadow-lg shadow-primary-500/20 flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
                Save Configuration
              </button>
            </div>
          </form>

        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
