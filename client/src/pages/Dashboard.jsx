import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import { CheckCircle2, XCircle, ExternalLink, RefreshCw, Briefcase, TrendingUp, Cpu, Activity, User, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import SkillGap3D from '../components/SkillGap3D';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/analysis/gap');
      setAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze skills. Make sure to set your preferred job role in Profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Job Seeker') {
      fetchAnalysis();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="flex-1 flex justify-center items-center h-[60vh]"><RefreshCw className="w-10 h-10 animate-spin text-primary-500" /></div>;

  if (user?.role !== 'Job Seeker') {
    return (
      <div className="flex-1 container mx-auto px-4 py-10 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-4 text-white">Administration Portal</h1>
          <p className="text-slate-400 mb-8 max-w-2xl">Manage listings and oversee the talent lifecycle. Navigate to the Jobs board to create or remove active job listings.</p>
          <Link to="/jobs" className="bg-primary-600 hover:bg-primary-500 px-6 py-3 rounded-xl text-white font-medium inline-block transition-colors">Go to Job Board</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/20 border border-slate-700/50 p-6 md:p-8 rounded-3xl backdrop-blur-md mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-6">
           <div className="hidden sm:flex w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-full items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
              <User className="w-8 h-8 text-white" />
           </div>
           <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Welcome back, {user.name}</h1>
            <p className="text-slate-400 text-sm md:text-base">Tracking alignment telemetry for: <span className="text-primary-400 font-semibold px-2 py-0.5 bg-primary-500/10 rounded-md border border-primary-500/20">{user.preferredJobRole || 'Market Standard'}</span></p>
           </div>
        </div>
        <button onClick={fetchAnalysis} className="bg-slate-900/80 hover:bg-primary-900 border border-slate-700 hover:border-primary-500/50 px-6 py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all font-medium text-slate-300 hover:text-white group whitespace-nowrap shadow-xl">
          <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 text-primary-400" /> Run Telemetry
        </button>
      </motion.div>

      {error ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-8 rounded-3xl flex flex-col items-center backdrop-blur-xl max-w-2xl mx-auto text-center">
          <XCircle className="w-16 h-16 mb-4 opacity-50" />
          <h3 className="text-2xl font-bold mb-2 text-white">Alignment Incomplete</h3>
          <p className="mb-8 max-w-lg">{error}</p>
          <Link to="/profile" className="bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 px-8 py-4 rounded-xl font-medium transition-all">Configure Profile Architecture</Link>
        </motion.div>
      ) : analysis ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          
          {/* Main Visualization Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6"
          >
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <Activity className="w-5 h-5 text-emerald-400 mb-2" />
                  <span className="text-2xl font-black text-white">{analysis.matchingSkills.length}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Validated</span>
               </div>
               <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                  <Target className="w-5 h-5 text-amber-400 mb-2" />
                  <span className="text-2xl font-black text-white">{analysis.missingSkills.length}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Missing</span>
               </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[340px]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl rounded-full"></div>
              
              <SkillGap3D analysis={analysis} preferredJobRole={user.preferredJobRole} />
              
              <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center bg-slate-900/90 backdrop-blur-xl mx-6 py-5 rounded-2xl border border-slate-700/80 shadow-2xl">
                <span className="text-xs text-slate-400 uppercase tracking-[0.2em] font-semibold mb-1">Affinity Matrix</span>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary-400 to-indigo-500 drop-shadow-lg">{analysis.score}%</div>
              </div>
            </div>
          </motion.div>

          {/* Action Panels */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 md:p-8 backdrop-blur-xl"
            >
              <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">Curriculum Recommendations</h2>
              {analysis.recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.recommendations.map(rec => (
                    <div key={rec.skill} className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5 flex items-start justify-between group hover:border-primary-500/50 hover:bg-slate-800/80 transition-all shadow-lg hover:shadow-primary-500/10">
                      <div className="flex-1 pr-4">
                        <span className="text-xs font-bold text-primary-400 bg-primary-500/10 px-2 py-1 rounded uppercase tracking-wider mb-3 inline-block border border-primary-500/20">Gap Context: {rec.skill}</span>
                        <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{rec.course.name}</p>
                      </div>
                      <a href={rec.course.link} target="_blank" rel="noopener noreferrer" className="shrink-0 w-12 h-12 bg-slate-800 border border-slate-600 rounded-full flex items-center justify-center group-hover:bg-primary-600 group-hover:border-primary-500 group-hover:scale-110 transition-all">
                        <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-white" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-10 text-center text-emerald-400 flex flex-col items-center">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Mastery Achieved</h3>
                  <p className="font-medium text-emerald-300/80 max-w-md">You have successfully mastered all tracked baseline requirements for this role. You are structurally prepared for deployment.</p>
                </div>
              )}
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-primary-900/80 via-slate-800/80 to-indigo-900/80 border border-primary-500/30 rounded-3xl p-8 md:p-10 relative overflow-hidden group hover:border-primary-500/60 transition-colors shadow-2xl"
            >
              <div className="relative z-10 md:w-3/4">
                <div className="flex items-center gap-3 mb-6">
                  <Briefcase className="w-8 h-8 text-primary-400" />
                  <h2 className="text-2xl font-bold text-white">Execute Career Move</h2>
                </div>
                <p className="text-slate-300 mb-8 leading-relaxed text-lg">Your profile architecture is primed. Deploy your resume directly to our curated list of active recruitment targets or run a custom deep ATS scan.</p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/ai-analysis" className="bg-slate-900 border border-slate-600 hover:bg-slate-800 hover:border-slate-500 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg flex items-center gap-2">Run Custom AI JD Match</Link>
                  <Link to="/jobs" className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-primary-500/30 flex items-center gap-2">Access Job Board</Link>
                </div>
              </div>
              <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 p-8 opacity-10 group-hover:opacity-20 group-hover:-translate-x-4 transition-all duration-700 pointer-events-none hidden md:block">
                <Cpu className="w-80 h-80 text-primary-400" />
              </div>
            </motion.div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
