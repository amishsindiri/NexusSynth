import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { SourceUploadModal } from '../components/workspace/SourceUploadModal';
import { SourceCard, SourceItem } from '../components/workspace/SourceCard';
import { SynthesisBuilderPanel } from '../components/workspace/SynthesisBuilderPanel';
import { ContradictionMatrixView, SynthesisReportData } from '../components/workspace/ContradictionMatrixView';
import { GroundedChatPanel } from '../components/workspace/GroundedChatPanel';
import { EntityKnowledgeMatrix } from '../components/workspace/EntityKnowledgeMatrix';
import {
  FileText,
  GitCompare,
  MessageSquare,
  Network,
  Plus,
  Upload,
  Layers,
  HelpCircle,
  Trash2,
  Loader2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import api from '../api/axiosClient';

export const WorkspaceDetailPage: React.FC = () => {
  const { id: workspaceId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'sources' | 'synthesis' | 'chat' | 'entities'>('sources');
  const [workspace, setWorkspace] = useState<any>(null);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [syntheses, setSyntheses] = useState<SynthesisReportData[]>([]);
  const [selectedSynthesis, setSelectedSynthesis] = useState<SynthesisReportData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sourceSearch, setSourceSearch] = useState('');

  const fetchWorkspaceData = async () => {
    if (!workspaceId) return;
    try {
      setLoading(true);
      const res = await api.get(`/workspaces/${workspaceId}`);
      setWorkspace(res.data.workspace);
      setSources(res.data.sources || []);
      setSyntheses(res.data.syntheses || []);
      if (res.data.syntheses && res.data.syntheses.length > 0) {
        setSelectedSynthesis(res.data.syntheses[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load workspace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [workspaceId]);

  const handleSourceUploaded = (newSource: any) => {
    setSources((prev) => [newSource, ...prev]);
  };

  const handleSourceDeleted = async (sourceId: string) => {
    if (!window.confirm('Are you sure you want to remove this source document?')) return;
    try {
      await api.delete(`/workspaces/${workspaceId}/sources/${sourceId}`);
      setSources((prev) => prev.filter((s) => s.id !== sourceId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error removing source.');
    }
  };

  const handleSynthesisCreated = (newSynthesis: any) => {
    setSyntheses((prev) => [newSynthesis, ...prev]);
    setSelectedSynthesis(newSynthesis);
    setActiveTab('synthesis');
  };

  const handleDeleteWorkspace = async () => {
    if (!window.confirm('Permanently delete this workspace and all associated documents and syntheses?')) return;
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      navigate('/dashboard');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting workspace.');
    }
  };

  const filteredSources = sources.filter(
    (s) =>
      s.title.toLowerCase().includes(sourceSearch.toLowerCase()) ||
      (s.authors && s.authors.toLowerCase().includes(sourceSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        currentDomain={workspace?.domain}
        workspaceTitle={workspace?.title}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          workspaces={workspace ? [{ id: workspace.id, title: workspace.title, domain: workspace.domain }] : []}
          activeTab={activeTab}
          setActiveTab={(tab: any) => setActiveTab(tab)}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              <p className="text-xs">Loading research workspace corpus & syntheses...</p>
            </div>
          ) : error || !workspace ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-xs text-rose-300">
              <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
              <p className="font-bold">{error || 'Workspace could not be found.'}</p>
              <Link to="/dashboard" className="mt-3 inline-block font-semibold text-cyan-400 underline">
                Return to Dashboard
              </Link>
            </div>
          ) : (
            <>
              {/* Workspace Header Banner */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-300 uppercase">
                      {workspace.domain.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-slate-500">
                      Created {new Date(workspace.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Ingest Source</span>
                    </button>
                    <button
                      onClick={handleDeleteWorkspace}
                      className="rounded-xl border border-slate-800 bg-slate-800/40 p-1.5 text-slate-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                      title="Delete Workspace"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {workspace.title}
                </h1>

                {/* Core Guiding Inquiry Box */}
                <div className="mt-3 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3.5 text-xs">
                  <span className="font-bold text-cyan-400 block mb-1">Guiding Research Question:</span>
                  <p className="text-slate-200 leading-relaxed font-serif italic text-sm">
                    "{workspace.research_question}"
                  </p>
                </div>
              </div>

              {/* Command Center Tabs */}
              <div className="flex border-b border-slate-800 space-x-1 sm:space-x-4">
                <button
                  onClick={() => setActiveTab('sources')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'sources'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>1. Source Library ({sources.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('synthesis')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'synthesis'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GitCompare className="h-4 w-4" />
                  <span>2. Synthesis & Matrix ({syntheses.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'chat'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>3. Grounded Q&A</span>
                </button>

                <button
                  onClick={() => setActiveTab('entities')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                    activeTab === 'entities'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Network className="h-4 w-4" />
                  <span>4. Entity Matrix</span>
                </button>
              </div>

              {/* TAB 1: Sources Library */}
              {activeTab === 'sources' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-white">Ingested Corpus Documents</h3>
                      <p className="text-xs text-slate-400">
                        {sources.length} document{sources.length !== 1 ? 's' : ''} parsed and indexed by Gemini 2.5 Flash.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={sourceSearch}
                        onChange={(e) => setSourceSearch(e.target.value)}
                        placeholder="Search sources..."
                        className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                      />
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Source</span>
                      </button>
                    </div>
                  </div>

                  {filteredSources.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center">
                      <FileText className="mx-auto h-8 w-8 text-slate-500 mb-2" />
                      <h4 className="text-sm font-bold text-white">No Sources in this Workspace</h4>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Upload PDF research papers or paste literature abstracts to trigger automatic AI claim extraction.
                      </p>
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                      >
                        <Upload className="h-4 w-4" />
                        <span>Ingest First Source</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredSources.map((source) => (
                        <SourceCard
                          key={source.id}
                          source={source}
                          workspaceId={workspace.id}
                          onDelete={handleSourceDeleted}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Synthesis & Contradiction Studio */}
              {activeTab === 'synthesis' && (
                <div className="space-y-8">
                  {/* Synthesis Builder Panel */}
                  <SynthesisBuilderPanel
                    workspaceId={workspace.id}
                    sources={sources}
                    onSynthesisCreated={handleSynthesisCreated}
                  />

                  {/* Previously Generated Syntheses in this Workspace */}
                  {syntheses.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-white">
                          Synthesized Knowledge Reports ({syntheses.length})
                        </h3>
                        <span className="text-xs text-slate-500">Click a report to inspect full matrices</span>
                      </div>

                      {/* Synthesis Selector Buttons */}
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {syntheses.map((sy) => {
                          const isSelected = selectedSynthesis?.id === sy.id;
                          return (
                            <button
                              key={sy.id}
                              onClick={() => setSelectedSynthesis(sy)}
                              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                  : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <GitCompare className="h-3.5 w-3.5" />
                              <span className="truncate max-w-[220px]">{sy.title}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Synthesis Detailed View */}
                      {selectedSynthesis && (
                        <div className="space-y-4">
                          <div className="flex justify-end">
                            <Link
                              to={`/workspaces/${workspace.id}/syntheses/${selectedSynthesis.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300"
                            >
                              <span>Open in Full Dedicated Report View</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                          <ContradictionMatrixView synthesis={selectedSynthesis} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Grounded Q&A Chat */}
              {activeTab === 'chat' && (
                <GroundedChatPanel
                  workspaceId={workspace.id}
                  workspaceTitle={workspace.title}
                  researchQuestion={workspace.research_question}
                  sourcesCount={sources.length}
                />
              )}

              {/* TAB 4: Entity Knowledge Matrix */}
              {activeTab === 'entities' && (
                <EntityKnowledgeMatrix sources={sources} />
              )}
            </>
          )}
        </main>
      </div>

      <SourceUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        workspaceId={workspaceId!}
        onSourceUploaded={handleSourceUploaded}
      />
    </div>
  );
};
