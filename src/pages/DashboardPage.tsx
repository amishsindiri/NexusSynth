import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { KpiStatCard } from '../components/common/KpiStatCard';
import { WorkspaceModal } from '../components/workspace/WorkspaceModal';
import {
  FolderKanban,
  FileText,
  GitCompare,
  AlertTriangle,
  Layers,
  Plus,
  ArrowRight,
  Clock,
  ExternalLink,
  Loader2,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import api from '../api/axiosClient';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load telemetry stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleWorkspaceCreated = (newWorkspace: any) => {
    fetchDashboardStats();
  };

  const metrics = data?.metrics || {
    totalWorkspaces: 0,
    totalSources: 0,
    totalClaims: 0,
    totalSyntheses: 0,
    totalContradictions: 0,
    totalWordsAnalyzed: 0,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar currentDomain={user?.primary_domain} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          workspaces={data?.workspaces || []}
          onOpenWorkspaceModal={() => setIsWorkspaceModalOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 p-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1">
                <span>Principal Research Console</span>
                <span>•</span>
                <span>{user?.institution || 'Independent Investigator'}</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Welcome back, {user?.full_name || 'Researcher'}
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                NexusSynth AI is actively monitoring your cross-source investigations, claim extractions, and empirical contradiction matrices.
              </p>
            </div>

            <button
              onClick={() => setIsWorkspaceModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-colors self-start sm:self-auto shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>New Research Workspace</span>
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              <p className="text-xs">Loading research telemetry and workspace matrix...</p>
            </div>
          ) : (
            <>
              {/* Telemetry KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <KpiStatCard
                  title="Workspaces"
                  value={metrics.totalWorkspaces}
                  subtitle="Active domain investigations"
                  icon={<FolderKanban className="h-5 w-5" />}
                  badgeColor="indigo"
                />
                <KpiStatCard
                  title="Sources Ingested"
                  value={metrics.totalSources}
                  subtitle="Parsed & indexed documents"
                  icon={<FileText className="h-5 w-5" />}
                  badgeColor="cyan"
                />
                <KpiStatCard
                  title="Claims Extracted"
                  value={metrics.totalClaims}
                  subtitle="Confidence-rated assertions"
                  icon={<CheckCircle2 className="h-5 w-5" />}
                  badgeColor="emerald"
                />
                <KpiStatCard
                  title="Contradictions Flagged"
                  value={metrics.totalContradictions}
                  subtitle="Empirical divergences"
                  icon={<AlertTriangle className="h-5 w-5" />}
                  badgeColor="rose"
                />
                <KpiStatCard
                  title="Syntheses Generated"
                  value={metrics.totalSyntheses}
                  subtitle="Multi-document reports"
                  icon={<GitCompare className="h-5 w-5" />}
                  badgeColor="purple"
                />
              </div>

              {/* Workspaces Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-white">Active Research Workspaces</h2>
                    <p className="text-xs text-slate-400">Select an isolated workspace to manage sources, run syntheses, or chat.</p>
                  </div>
                  <button
                    onClick={() => setIsWorkspaceModalOpen(true)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                  >
                    + Create Workspace
                  </button>
                </div>

                {data?.workspaces?.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center">
                    <FolderKanban className="mx-auto h-8 w-8 text-slate-500 mb-2" />
                    <h3 className="text-sm font-bold text-white">No Research Workspaces Yet</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Create your first workspace or click the button below to initialize a sample investigation.
                    </p>
                    <button
                      onClick={() => setIsWorkspaceModalOpen(true)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Workspace</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.workspaces.map((ws: any) => (
                      <Link
                        key={ws.id}
                        to={`/workspaces/${ws.id}`}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 transition-all hover:border-slate-700 hover:bg-slate-900 hover:shadow-lg hover:shadow-indigo-500/5"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="rounded-md border border-slate-700/80 bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                              {ws.domain.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {new Date(ws.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                            {ws.title}
                          </h3>

                          <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            <span className="font-semibold text-slate-300">Core Inquiry: </span>
                            {ws.research_question}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3 text-cyan-400" />
                              <span>{ws.source_count || 0} Sources</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <GitCompare className="h-3 w-3 text-purple-400" />
                              <span>{ws.synthesis_count || 0} Reports</span>
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-0.5 transition-transform font-medium text-[11px]">
                            <span>Open</span>
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Split: Recent Synthesis Reports & Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Syntheses */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <GitCompare className="h-4 w-4 text-purple-400" />
                      <span>Recent Synthesis Reports</span>
                    </h3>
                  </div>

                  {!data?.recentSyntheses || data.recentSyntheses.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-4 text-center">
                      No multi-source syntheses generated yet.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {data.recentSyntheses.map((sy: any) => (
                        <div
                          key={sy.id}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 hover:border-slate-700 transition-colors"
                        >
                          <div className="min-w-0 flex-1 mr-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="rounded bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase">
                                {sy.synthesis_mode?.replace(/_/g, ' ')}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {new Date(sy.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white truncate">{sy.title}</h4>
                          </div>

                          <span className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 shrink-0">
                            View Report →
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Activity Feed */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="h-4 w-4 text-cyan-400" />
                      <span>Audit Telemetry Feed</span>
                    </h3>
                  </div>

                  {!data?.recentActivity || data.recentActivity.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-4 text-center">
                      No recent activity recorded.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {data.recentActivity.map((act: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs">
                          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            act.type === 'SOURCE_INGESTED' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {act.type === 'SOURCE_INGESTED' ? <FileText className="h-3 w-3" /> : <GitCompare className="h-3 w-3" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-slate-300 truncate font-medium">{act.title}</p>
                            <span className="text-[10px] text-slate-500">
                              {act.type === 'SOURCE_INGESTED' ? 'Source Ingested' : 'Synthesis Run'} • {new Date(act.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </div>
  );
};
