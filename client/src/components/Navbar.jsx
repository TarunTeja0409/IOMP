import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { BrainCircuit, LogOut, User, LayoutDashboard, BriefcaseBusiness, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b border-white/10 bg-surface/40 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors">
          <BrainCircuit className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-white">Smart Skill Gap Analyzer</span>
        </Link>
        
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link to="/ai-analysis" className="text-sm font-medium text-primary-400 hover:text-primary-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Matcher
              </Link>
              <Link to="/jobs" className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-2">
                <BriefcaseBusiness className="w-4 h-4" /> Jobs
              </Link>
              <Link to="/profile" className="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-2">
                <User className="w-4 h-4" /> Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="text-sm font-medium text-red-400 hover:text-red-300 flex items-center gap-2 transition"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white">Log in</Link>
              <Link to="/register" className="text-sm font-medium bg-primary-500 hover:bg-primary-400 text-surface px-5 py-2.5 rounded-full transition-all duration-300 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-0.5">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
