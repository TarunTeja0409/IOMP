import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/axios';
import { useAuthStore } from '../store/authStore';
import { Building2, MapPin, Search, Briefcase, DollarSign, Clock, ExternalLink, Globe } from 'lucide-react';

// Replaced static mocks with live /jobs/realtime API integrations

const Jobs = () => {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  // Employer post form
  const [showPostForm, setShowPostForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', requiredSkills: '', qualifications: '', location: '', jobType: 'Private'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user?.role === 'Job Seeker') {
        const userSkills = user.skills?.map(s => s.toLowerCase()) || [];
        
        // 1. Fetch Internal DB recommendations
        const resDb = await api.get('/analysis/recommended-jobs');
        const dbJobsFormatted = resDb.data.map(j => ({ ...j, company: 'Internal DB', roleType: j.jobType, salary: 'Competitive' }));
        
        // 2. Fetch True Real Time Jobs from API
        let liveJobsFormatted = [];
        try {
           const resLive = await api.get('/jobs/realtime');
           liveJobsFormatted = resLive.data.map(job => {
             const required = job.requiredSkills.map(s => s.toLowerCase());
             const matching = required.filter(s => userSkills.includes(s));
             const score = required.length > 0 ? Math.round((matching.length / required.length) * 100) : 0;
             return { ...job, matchScore: score };
           });
        } catch (liveErr) {
           console.error("Failed to load live jobs API", liveErr);
        }

        // Blend Live API Jobs + Internal Jobs (Replace static mocks)
        setJobs([...liveJobsFormatted, ...dbJobsFormatted].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)));
      } else {
        const res = await api.get('/jobs');
        setJobs(res.data.map(j => ({ ...j, company: 'Internal DB', roleType: j.jobType, salary: 'Competitive' })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleApply = async (job) => {
    if (job._id.toString().startsWith('api_')) {
      window.open(job.link, '_blank');
      return;
    }
    try {
      await api.post('/applications', { jobId: job._id });
      alert('Applied successfully to Internal Job DB!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to apply');
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(filter.toLowerCase()) || 
    job.company.toLowerCase().includes(filter.toLowerCase())
  );

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
        qualifications: formData.qualifications.split(',').map(s => s.trim()).filter(Boolean)
      };
      await api.post('/jobs', payload);
      alert('Job posted successfully!');
      setShowPostForm(false);
      setFormData({ title: '', description: '', requiredSkills: '', qualifications: '', location: '', jobType: 'Private' });
      fetchData();
    } catch (err) {
      alert('Failed to post job');
    }
  };

  if (loading) return <div className="flex-1 flex justify-center items-center text-white">Loading Live Jobs Grid...</div>;

  return (
    <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Globe className="w-8 h-8 text-primary-400" />
            {user?.role === 'Job Seeker' ? 'Real-Time Job Market' : 'Job Board Admin'}
          </h1>
          <p className="text-slate-400 mt-2">Discover roles that match your curated skill profile perfectly.</p>
        </div>
        
        {user?.role === 'Employer' && (
          <button 
            onClick={() => setShowPostForm(!showPostForm)}
            className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl transition shadow-lg shadow-primary-500/20 font-medium"
          >
            {showPostForm ? 'Cancel Creation' : '+ Create New Listing'}
          </button>
        )}
      </motion.div>



      {/* Search Bar */}
      {!showPostForm && (
        <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl mb-8 flex items-center gap-3 backdrop-blur-xl">
          <Search className="w-6 h-6 text-slate-500" />
          <input 
            type="text"
            placeholder="Search by role or company (e.g. 'Frontend', 'Google')"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-slate-600"
          />
        </div>
      )}

      {showPostForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-8">
          <form onSubmit={handlePostJob} className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl backdrop-blur-xl flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-white mb-2">Create New Job Listing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Job Title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:border-primary-500 outline-none" />
              <input type="text" placeholder="Location (e.g. Remote, NY)" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:border-primary-500 outline-none" />
            </div>
            
            <textarea placeholder="Job Description" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:border-primary-500 outline-none min-h-[120px]" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Required Skills (Comma separated)" required value={formData.requiredSkills} onChange={e => setFormData({...formData, requiredSkills: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:border-primary-500 outline-none" />
              <select value={formData.jobType} onChange={e => setFormData({...formData, jobType: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-white focus:border-primary-500 outline-none">
                <option value="Private">Private</option>
                <option value="Government">Government</option>
              </select>
            </div>
            
            <button type="submit" className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl mt-4 transition-colors">Publish Listing</button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-slate-700 border-dashed rounded-3xl">
             <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
             <p className="text-slate-400">No jobs match your search criteria.</p>
          </div>
        ) : filteredJobs.map((job, idx) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            key={job._id} 
            className="bg-slate-800/40 p-6 md:p-8 rounded-3xl border border-slate-700/50 hover:border-primary-500/50 hover:bg-slate-800/80 transition-all flex flex-col h-full group"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-slate-300 group-hover:text-primary-400 transition-colors" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-300 transition-colors">{job.title}</h3>
                  <p className="text-slate-400 font-medium">{job.company}</p>
                </div>
              </div>
              {job.matchScore !== undefined && (
                <div className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${job.matchScore >= 80 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : job.matchScore >= 50 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                  {job.matchScore}% Match
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-400 mb-6">
              <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-500"/> {job.location}</div>
              <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-500"/> {job.roleType}</div>
              <div className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-slate-500"/> {job.salary}</div>
            </div>

            <p className="text-slate-300 leading-relaxed text-sm mb-6 flex-1">{job.description}</p>
            
            <div className="mb-8">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Required Tech Stack</h4>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills?.slice(0,5).map(s => (
                  <span key={s} className="bg-slate-900 border border-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {user?.role === 'Job Seeker' && (
              <button 
                onClick={() => handleApply(job)}
                className="w-full bg-slate-700/50 hover:bg-primary-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-primary-500/20"
              >
                Apply Now <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Jobs;
