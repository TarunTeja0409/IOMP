import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Target, TrendingUp } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-slate-900 border-t border-slate-800">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 z-10 py-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
            Bridge the gap to your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 via-primary-500 to-emerald-400">
              Dream Career
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Analyze your skills, identify the missing links, and get personalized learning paths and job recommendations to level up your professional life.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link 
              to="/register" 
              className="px-8 py-4 bg-primary-500 hover:bg-primary-400 text-surface rounded-full font-semibold shadow-xl shadow-primary-500/20 transition-all hover:scale-105 hover:shadow-primary-500/40"
            >
              Get Started for Free
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-semibold transition-all backdrop-blur-sm"
            >
              Log in
            </Link>
          </div>
        </motion.div>

        <motion.div 
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-surface/40 p-8 rounded-3xl border border-white/5 backdrop-blur-xl hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1 text-left shadow-2xl">
            <div className="bg-primary-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Skill Analysis</h3>
            <p className="text-slate-400">Instantly match your current profile against industry standards and job requirements.</p>
          </div>
          
          <div className="bg-surface/40 p-8 rounded-3xl border border-white/5 backdrop-blur-xl hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1 text-left shadow-2xl">
            <div className="bg-indigo-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Personalized Paths</h3>
            <p className="text-slate-400">Discover curated courses and learning resources specifically targeted at your skill gaps.</p>
          </div>

          <div className="bg-surface/40 p-8 rounded-3xl border border-white/5 backdrop-blur-xl hover:border-primary-500/30 transition-all duration-300 hover:-translate-y-1 text-left shadow-2xl">
            <div className="bg-teal-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Code2 className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Job Matches</h3>
            <p className="text-slate-400">Get matched with public and private sector jobs that exactly fit what you know and are learning.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
