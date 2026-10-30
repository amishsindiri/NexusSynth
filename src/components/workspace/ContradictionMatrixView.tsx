import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Table,
  Compass,
  FileText,
  BadgeCheck,
  ShieldAlert,
  Flame,
  ArrowUpRight,
} from 'lucide-react';

export interface SynthesisReportData {
  id: string;
  title: string;
  synthesis_mode: string;
  focus_directive?: string;
  source_ids?: string[];
  executive_synthesis: string;
  consensus_points?: Array<{
    theme: string;
    synthesis_statement: string;
    supporting_sources: string[];
    strength_of_agreement: string;
  }>;
  contradictions?: Array<{
    topic: string;
    conflicting_positions: string;
    sources_involved: string[];
    methodological_explanation: string;
  }>;
  research_gaps?: Array<{
    gap_title: string;
    description: string;
    suggested_next_study: string;
    priority: string;
  }>;
  evidence_matrix?: Array<{
    dimension: string;
    comparative_finding: string;
    primary_source_ref: string;
    evidence_quality: string;
  }>;
  recommendations?: Array<{
    action: string;
    rationale: string;
    expected_impact: string;
  }>;
  created_at: string;
}

interface ContradictionMatrixViewProps {
  synthesis: SynthesisReportData;
}

export const ContradictionMatrixView: React.FC<ContradictionMatrixViewProps> = ({ synthesis }) => {
  const [activeSection, setActiveSection] = useState<'all' | 'contradictions' | 'consensus' | 'gaps' | 'matrix' | 'recommendations'>('all');

  const consensus = synthesis.consensus_points || [];
  const contradictions = synthesis.contradictions || [];
  const gaps = synthesis.research_gaps || [];
  const evidence = synthesis.evidence_matrix || [];
  const recommendations = synthesis.recommendations || [];

  return (
    <div className="space-y-6">
      {/* Executive Synthesis Overview Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{synthesis.title}</h3>
              <p className="text-xs text-slate-400">Mode: {synthesis.synthesis_mode.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {new Date(synthesis.created_at).toLocaleDateString()}
          </span>
        </div>

        {synthesis.focus_directive && (
          <div className="mb-4 rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3 text-xs text-indigo-300">
            <span className="font-semibold block mb-0.5">Researcher Focus Directive:</span>
            {synthesis.focus_directive}
          </div>
        )}

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 leading-relaxed space-y-3 whitespace-pre-line">
          {synthesis.executive_synthesis}
        </div>
      </div>

      {/* Navigation Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSection('all')}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeSection === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          All Findings ({contradictions.length + consensus.length + gaps.length})
        </button>
        <button
          onClick={() => setActiveSection('contradictions')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeSection === 'contradictions'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-800/80 text-rose-400 hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Contradictions ({contradictions.length})</span>
        </button>
        <button
          onClick={() => setActiveSection('consensus')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeSection === 'consensus'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800/80 text-emerald-400 hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Consensus ({consensus.length})</span>
        </button>
        <button
          onClick={() => setActiveSection('gaps')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeSection === 'gaps'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-800/80 text-amber-400 hover:bg-slate-800'
          }`}
        >
          <Lightbulb className="h-3.5 w-3.5" />
          <span>Research Gaps ({gaps.length})</span>
        </button>
        <button
          onClick={() => setActiveSection('matrix')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeSection === 'matrix'
              ? 'bg-cyan-600 text-white'
              : 'bg-slate-800/80 text-cyan-400 hover:bg-slate-800'
          }`}
        >
          <Table className="h-3.5 w-3.5" />
          <span>Evidence Table ({evidence.length})</span>
        </button>
        <button
          onClick={() => setActiveSection('recommendations')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            activeSection === 'recommendations'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800/80 text-purple-400 hover:bg-slate-800'
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Recommendations ({recommendations.length})</span>
        </button>
      </div>

      {/* 1. Empirical Contradictions Section */}
      {(activeSection === 'all' || activeSection === 'contradictions') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4" />
              Empirical Contradictions & Methodological Divergence ({contradictions.length})
            </h3>
            <span className="text-[11px] text-slate-500">Root causes of conflicting experimental outcomes</span>
          </div>

          {contradictions.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-4 rounded-xl border border-slate-800 bg-slate-900/40">
              No empirical contradictions detected across the analyzed parameters.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {contradictions.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-rose-500/30 bg-rose-950/10 p-5 border-l-4 border-l-rose-500 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-rose-300 uppercase tracking-wide">
                      Contradiction #{idx + 1}: {item.topic}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {item.sources_involved?.map((src, i) => (
                        <span key={i} className="rounded bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 text-[10px] font-medium text-rose-300">
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3.5 my-3">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Conflicting Empirical Positions:
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-mono">
                      {item.conflicting_positions}
                    </p>
                  </div>

                  <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3.5 text-xs">
                    <span className="text-[11px] font-bold text-indigo-300 block mb-1">
                      Methodological Root Cause Explanation:
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {item.methodological_explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Consensus Points Section */}
      {(activeSection === 'all' || activeSection === 'consensus') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <BadgeCheck className="h-4 w-4" />
              Consensus & Convergent Evidence ({consensus.length})
            </h3>
            <span className="text-[11px] text-slate-500">Cross-verified empirical agreements</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {consensus.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-5 border-l-4 border-l-emerald-500"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-xs font-bold text-white">{item.theme}</h4>
                  <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                    {item.strength_of_agreement} AGREEMENT
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-2">
                  {item.synthesis_statement}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1">Supporting Sources:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.supporting_sources?.map((s, i) => (
                      <span key={i} className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Research Gaps Section */}
      {(activeSection === 'all' || activeSection === 'gaps') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Critical Unexplored Research Gaps ({gaps.length})
            </h3>
            <span className="text-[11px] text-slate-500">Frontiers for subsequent investigation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gaps.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-amber-500/30 bg-amber-950/10 p-5 border-l-4 border-l-amber-500"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-xs font-bold text-white">{item.gap_title}</h4>
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase">
                    {item.priority} PRIORITY
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {item.description}
                </p>
                <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 p-3 text-xs">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase block mb-1">
                    Suggested Next Empirical Study:
                  </span>
                  <p className="text-slate-300 leading-relaxed">{item.suggested_next_study}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Comparative Evidence Table */}
      {(activeSection === 'all' || activeSection === 'matrix') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Table className="h-4 w-4" />
              Thematic Evidence Matrix ({evidence.length})
            </h3>
            <span className="text-[11px] text-slate-500">Direct parameter benchmarks</span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Dimension / Metric</th>
                  <th className="px-4 py-3">Comparative Findings Across Sources</th>
                  <th className="px-4 py-3">Primary Source Attributions</th>
                  <th className="px-4 py-3">Evidence Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {evidence.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{row.dimension}</td>
                    <td className="px-4 py-3 leading-relaxed">{row.comparative_finding}</td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{row.primary_source_ref}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-400">
                        {row.evidence_quality}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Actionable Recommendations */}
      {(activeSection === 'all' || activeSection === 'recommendations') && recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <Compass className="h-4 w-4" />
            Evidence-Based Strategic Recommendations ({recommendations.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-purple-500/30 bg-purple-950/10 p-5 border-l-4 border-l-purple-500"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <h4 className="text-xs font-bold text-white">{rec.action}</h4>
                </div>
                <p className="text-xs text-slate-300 mb-2.5 leading-relaxed">
                  <span className="font-semibold text-slate-400">Rationale: </span>
                  {rec.rationale}
                </p>
                <div className="rounded-lg bg-slate-950/60 p-2.5 text-xs text-purple-300 border border-purple-900/30">
                  <span className="font-semibold block mb-0.5 text-purple-200">Expected Empirical Impact:</span>
                  {rec.expected_impact}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
