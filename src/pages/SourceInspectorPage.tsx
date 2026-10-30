import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { ClaimBadgeList } from '../components/workspace/ClaimBadgeList';
import {
  FileText,
  ArrowLeft,
  Calendar,
  User,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Tag,
  Hash,
  Activity,
  Layers,
  Loader2,
} from 'lucide-react';
import api from '../api/axiosClient';

export const SourceInspectorPage: React.FC = () => {
  const { id: workspaceId, sourceId } = useParams<{ id: string; sourceId: string }>();
  const [source, setSource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);

  useEffect(() => {
    const fetchSource = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/workspaces/${workspaceId}/sources/${sourceId}`);
        setSource(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to retrieve source document details.');
      } finally {
        setLoading(false);
      }
    };
    fetchSource();
  }, [workspaceId, sourceId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 space-y-6">
        {/* Back Link Breadcrumb */}
        <div>
          <Link
            to={`/workspaces/${workspaceId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Workspace Command Center</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            <p className="text-xs">Deconstructing document and empirical claims...</p>
          </div>
        ) : error || !source ? (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center text-xs text-rose-300">
            <AlertCircle className="mx-auto h-8 w-8 mb-2" />
            <p className="font-bold">{error || 'Source document not found.'}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Document Metadata Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
                <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                  {source.source_type?.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {source.source_url && (
                    <a
                      href={source.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Original Link / DOI</span>
                    </a>
                  )}
                  <span>Ingested: {new Date(source.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {source.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="font-medium text-slate-300">{source.authors || 'Unknown Author'}</span>
                </div>
                {source.publication_year && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-slate-500" />
                    <span>Publication Year: {source.publication_year}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Hash className="h-4 w-4 text-slate-500" />
                  <span>{source.word_count || 0} Total Words</span>
                </div>
              </div>

              {/* AI Executive Summary */}
              {source.ai_summary && (
                <div className="mt-5 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4">
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                    Gemini Executive Summary:
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-serif">
                    {source.ai_summary}
                  </p>
                </div>
              )}
            </div>

            {/* Split Grid: Methodology & Limitations vs Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Methodology Notes */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Methodological Assessment
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {source.methodology_notes || 'No specific methodology critique recorded.'}
                </p>
              </div>

              {/* Study Limitations */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Identified Constraints & Limitations
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {source.limitations || 'No explicit constraints recorded.'}
                </p>
              </div>
            </div>

            {/* Extracted Empirical Claims */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Extracted Empirical Claims ({source.key_claims?.length || 0})</span>
                </h3>
                <span className="text-xs text-slate-500">Confidence rated by Gemini 2.5</span>
              </div>

              <ClaimBadgeList claims={source.key_claims || []} />
            </div>

            {/* Key Quantitative Metrics Table */}
            {source.key_metrics && source.key_metrics.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-3">
                <h3 className="text-sm font-bold text-white">Reported Quantitative Metrics</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase">
                      <tr>
                        <th className="px-4 py-2.5">Metric Name</th>
                        <th className="px-4 py-2.5">Reported Value</th>
                        <th className="px-4 py-2.5">Experimental Context</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {source.key_metrics.map((m: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 font-semibold text-white">{m.metric_name}</td>
                          <td className="px-4 py-2.5 font-mono text-cyan-300 font-bold">{m.value}</td>
                          <td className="px-4 py-2.5 text-slate-400">{m.context}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Concept & Entity Tags */}
            {source.entities && source.entities.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Normalized Concepts & Entity Tags ({source.entities.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {source.entities.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-200"
                    >
                      <Tag className="h-3 w-3 text-indigo-400" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Raw Extracted Document Text Accordion */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <button
                type="button"
                onClick={() => setShowRawText(!showRawText)}
                className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-300 hover:text-white"
              >
                <span>{showRawText ? 'Hide' : 'Inspect'} Full Ingested Source Text ({source.raw_text?.length || 0} characters)</span>
                <span className="text-cyan-400">{showRawText ? '▲ Collapse' : '▼ Expand'}</span>
              </button>

              {showRawText && (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {source.raw_text}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
