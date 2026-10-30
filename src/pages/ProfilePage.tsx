import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Building,
  Mail,
  Compass,
  Layers,
  Database,
  Cpu,
  ShieldCheck,
  Calendar,
  Save,
  CheckCircle2,
} from 'lucide-react';
import api from '../api/axiosClient';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoading(true);
        const res = await api.get('/auth/me');
        setStats(res.data.stats);
      } catch (err) {
        console.error('Error fetching profile stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Researcher Profile & Preferences</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your credentials, default scientific domain, and review platform telemetry.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-md space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-extrabold text-2xl shadow-lg shadow-indigo-600/30">
              {user?.full_name?.charAt(0).toUpperCase() || 'R'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{user?.full_name}</h2>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Active Researcher
                </span>
                <span className="text-[11px] text-slate-500">
                  Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
              <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                Primary Institution / Affiliation
              </span>
              <p className="font-medium text-slate-200">{user?.institution || 'Independent Researcher'}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
              <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                Default Target Domain
              </span>
              <p className="font-medium text-cyan-300">{user?.primary_domain?.replace(/_/g, ' ') || 'Scientific & Academic'}</p>
            </div>
          </div>
        </div>

        {/* Aggregate Telemetry */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Workspace Utilization Telemetry
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400 font-medium">Workspaces Provisioned</span>
              <p className="text-2xl font-black text-white mt-1">{stats?.totalWorkspaces || 0}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400 font-medium">Total Sources Ingested</span>
              <p className="text-2xl font-black text-cyan-400 mt-1">{stats?.totalSources || 0}</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
              <span className="text-xs text-slate-400 font-medium">Synthesis Reports Generated</span>
              <p className="text-2xl font-black text-purple-400 mt-1">{stats?.totalSyntheses || 0}</p>
            </div>
          </div>
        </div>

        {/* System Architecture Specifications */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <span>Platform Architecture Specifications</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
            <div className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
              <Cpu className="h-4 w-4 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">AI Intelligence SDK</span>
                <span className="text-slate-400">@google/genai (Gemini 2.5 Flash)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
              <Database className="h-4 w-4 text-indigo-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Database Engine</span>
                <span className="text-slate-400">PostgreSQL with Row Level Isolation</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Zero-Hallucination Policy</span>
                <span className="text-slate-400">Strict inline attribution to Source IDs</span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
              <Layers className="h-4 w-4 text-purple-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">Multi-Modal Ingestion</span>
                <span className="text-slate-400">Multer + pdf-parse (up to 10MB)</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
