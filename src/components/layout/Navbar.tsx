import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  LogOut,
  User as UserIcon,
  Layers,
  FlaskConical,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  currentDomain?: string;
  workspaceTitle?: string;
}

export const DOMAIN_LABELS: Record<string, { label: string; color: string }> = {
  ACADEMIC_SCIENTIFIC: { label: 'Scientific & Academic', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  CLINICAL_BIOTECH: { label: 'Clinical & Biotech', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  MARKET_COMPETITIVE: { label: 'Market & Competitive', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  POLICY_REGULATORY: { label: 'Policy & Regulatory', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  TECH_ENGINEERING: { label: 'Deep Tech & Engineering', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  FINANCIAL_MACRO: { label: 'Macro & Financial', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
};

export const Navbar: React.FC<NavbarProps> = ({ currentDomain, workspaceTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const domainConfig = currentDomain && DOMAIN_LABELS[currentDomain]
    ? DOMAIN_LABELS[currentDomain]
    : user?.primary_domain && DOMAIN_LABELS[user.primary_domain]
    ? DOMAIN_LABELS[user.primary_domain]
    : { label: 'Multi-Source Synthesis', color: 'bg-slate-700/50 text-slate-300 border-slate-600' };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 md:px-6 backdrop-blur-md">
      {/* Brand & Workspace Title */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2.5 font-bold tracking-tight text-white transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-md shadow-indigo-500/20">
            <FlaskConical className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold leading-none tracking-tight">NexusSynth<span className="text-cyan-400">.AI</span></span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Research Synthesis</span>
          </div>
        </Link>

        {workspaceTitle && (
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800 text-sm font-medium text-slate-300">
            <Layers className="h-4 w-4 text-slate-500" />
            <span className="truncate max-w-xs">{workspaceTitle}</span>
          </div>
        )}
      </div>

      {/* Center / Domain Badge */}
      <div className="hidden sm:flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${domainConfig.color}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          {domainConfig.label}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-950/60 px-2.5 py-1 text-[11px] font-medium text-slate-400">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          Grounded Citations
        </span>
      </div>

      {/* Right Controls / User Account */}
      <div className="flex items-center gap-3">
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-800/60 p-1.5 sm:px-3 sm:py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600/40 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
                {user.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="font-semibold text-white leading-tight truncate max-w-[120px]">{user.full_name}</span>
                <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.institution || 'Researcher'}</span>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-800/40 text-slate-400 transition-colors hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
