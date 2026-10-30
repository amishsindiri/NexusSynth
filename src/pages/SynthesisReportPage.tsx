import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { ContradictionMatrixView, SynthesisReportData } from '../components/workspace/ContradictionMatrixView';
import {
  ArrowLeft,
  GitCompare,
  Printer,
  Trash2,
  FileText,
  Loader2,
  AlertTriangle,
  Download,
} from 'lucide-react';
import api from '../api/axiosClient';

export const SynthesisReportPage: React.FC = () => {
  const { id: workspaceId, synthesisId } = useParams<{ id: string; synthesisId: string }>();
  const navigate = useNavigate();

  const [synthesis, setSynthesis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSynthesis = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/workspaces/${workspaceId}/syntheses/${synthesisId}`);
        setSynthesis(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load synthesis report.');
      } finally {
        setLoading(false);
      }
    };
    fetchSynthesis();
  }, [workspaceId, synthesisId]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this synthesis report?')) return;
    try {
      await api.delete(`/workspaces/${workspaceId}/syntheses/${synthesisId}`);
      navigate(`/workspaces/${workspaceId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting synthesis.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to={`/workspaces/${workspaceId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Workspace Command Center</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF Export</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Report</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <p className="text-xs">Loading comparative synthesis matrix...</p>
          </div>
        ) : error || !synthesis ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-xs text-rose-300">
            <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
            <p className="font-bold">{error || 'Synthesis report not found.'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Synthesized Documents Chips Banner */}
            {synthesis.synthesized_sources && synthesis.synthesized_sources.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Corpus Sources Cross-Examined in this Report ({synthesis.synthesized_sources.length}):
                </span>
                <div className="flex flex-wrap gap-2">
                  {synthesis.synthesized_sources.map((s: any) => (
                    <Link
                      key={s.id}
                      to={`/workspaces/${workspaceId}/sources/${s.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800 px-3 py-1 text-xs text-slate-200 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5 text-indigo-400" />
                      <span className="font-semibold">{s.title}</span>
                      <span className="text-slate-500 text-[11px]">({s.publication_year || 'N/A'})</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Complete Contradiction Matrix View */}
            <ContradictionMatrixView synthesis={synthesis} />
          </div>
        )}
      </main>
    </div>
  );
};
