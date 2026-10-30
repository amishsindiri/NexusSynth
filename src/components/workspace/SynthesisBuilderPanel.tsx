import React, { useState } from 'react';
import {
  GitCompare,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  FileCheck,
  CheckCircle2,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import api from '../../api/axiosClient';
import { SourceItem } from './SourceCard';

interface SynthesisBuilderPanelProps {
  workspaceId: string;
  sources: SourceItem[];
  onSynthesisCreated: (synthesis: any) => void;
}

const MODES = [
  {
    id: 'CONTRADICTION_MATRIX',
    title: 'Consensus vs. Contradiction Matrix',
    desc: 'Scrutinizes sources for conflicting empirical outcomes, differing sample sizes, and uncovers root methodological divergence.',
    icon: GitCompare,
    badge: 'Contradiction Discovery',
    badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
  },
  {
    id: 'LITERATURE_REVIEW',
    title: 'Comprehensive Literature Review',
    desc: 'Synthesizes foundational consensus, historical progression of evidence, and thematic alignment across all selected materials.',
    icon: BookOpen,
    badge: 'Systematic Synthesis',
    badgeColor: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
  },
  {
    id: 'GAP_ANALYSIS',
    title: 'Research Gap Finder',
    desc: 'Pinpoints unexplored frontiers, missing experimental controls, unaddressed demographics, and proposes next-phase studies.',
    icon: Lightbulb,
    badge: 'Frontier Discovery',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-500/10',
  },
  {
    id: 'EXECUTIVE_DECISION_BRIEF',
    title: 'Executive Evidence Brief',
    desc: 'Dense, decision-focused recommendations formatted for principal investigators, R&D directors, and clinical leads.',
    icon: FileCheck,
    badge: 'Actionable Brief',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
  },
];

const FOCUS_PRESETS = [
  'Evaluate trade-offs between endosomal escape efficiency and repeated-dosing immunogenicity.',
  'Analyze differences in sample cohort demographics and their impact on statistical power.',
  'Examine conflicting reports regarding particle size stability and long-term shelf-life.',
  'Determine whether lower N/P charge ratios sacrifice translational protein output.',
];

export const SynthesisBuilderPanel: React.FC<SynthesisBuilderPanelProps> = ({
  workspaceId,
  sources,
  onSynthesisCreated,
}) => {
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>(() =>
    sources.map((s) => s.id)
  );
  const [title, setTitle] = useState('');
  const [synthesisMode, setSynthesisMode] = useState('CONTRADICTION_MATRIX');
  const [focusDirective, setFocusDirective] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progressStep, setProgressStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toggleSource = (sourceId: string) => {
    setSelectedSourceIds((prev) =>
      prev.includes(sourceId) ? prev.filter((id) => id !== sourceId) : [...prev, sourceId]
    );
  };

  const selectAll = () => {
    setSelectedSourceIds(sources.map((s) => s.id));
  };

  const deselectAll = () => {
    setSelectedSourceIds([]);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedSourceIds.length < 2) {
      setError('Please select at least 2 sources to execute a cross-source synthesis.');
      return;
    }

    const synthesisTitle = title.trim() || `Cross-Source ${MODES.find((m) => m.id === synthesisMode)?.title || 'Synthesis'}`;

    try {
      setIsSubmitting(true);
      setProgressStep('Cross-indexing claims and methodologies across selected corpus...');

      setTimeout(() => {
        setProgressStep('Gemini 2.5 Flash is mapping points of consensus and empirical divergence...');
      }, 1500);

      setTimeout(() => {
        setProgressStep('Building Evidence Matrix, Research Gaps, and Grounded Attributions...');
      }, 3500);

      const res = await api.post(`/workspaces/${workspaceId}/syntheses`, {
        title: synthesisTitle,
        source_ids: selectedSourceIds,
        synthesis_mode: synthesisMode,
        focus_directive: focusDirective.trim() || null,
      });

      onSynthesisCreated(res.data);
      setTitle('');
      setFocusDirective('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Synthesis generation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
      setProgressStep(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-md backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-indigo-400" />
            Cross-Source Synthesis & Contradiction Studio
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select 2 to 10 ingested sources to synthesize findings, identify empirical disagreements, and pinpoint unexplored research gaps.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="rounded-lg border border-slate-800 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Select All ({sources.length})
          </button>
          <button
            type="button"
            onClick={deselectAll}
            className="rounded-lg border border-slate-800 bg-slate-800/60 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200"
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isSubmitting && progressStep && (
        <div className="mb-6 rounded-xl border border-indigo-500/40 bg-indigo-950/40 p-5">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">{progressStep}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                NexusSynth AI is rigorously verifying citations and evaluating methodological divergence...
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-6">
        {/* Step 1: Source Selection Checklist */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Select Sources to Cross-Examine ({selectedSourceIds.length} of {sources.length} selected)
            </label>
            <span className="text-[11px] text-indigo-400 font-medium">Minimum 2 sources required</span>
          </div>

          {sources.length < 2 ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-300">
              You need at least 2 ingested sources in this workspace before running a synthesis. Upload or paste research papers in Tab 1.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {sources.map((s) => {
                const isChecked = selectedSourceIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleSource(s.id)}
                    className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all ${
                      isChecked
                        ? 'border-indigo-500/60 bg-indigo-950/20 ring-1 ring-indigo-500/40'
                        : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by div
                      className="mt-0.5 h-4 w-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">{s.title}</p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {s.authors || 'Unknown Author'} ({s.publication_year || 'N/A'}) • {s.word_count || 0} words
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: Synthesis Mode Selection Cards */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2.5">
            2. Choose Synthesis Cognitive Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {MODES.map((mode) => {
              const isSelected = synthesisMode === mode.id;
              const IconComp = mode.icon;
              return (
                <div
                  key={mode.id}
                  onClick={() => setSynthesisMode(mode.id)}
                  className={`flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/30 shadow-md shadow-indigo-600/10 ring-1 ring-indigo-500'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <IconComp className="h-4 w-4" />
                      </div>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${mode.badgeColor}`}>
                        {mode.badge}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white leading-snug">{mode.title}</h4>
                    <p className="mt-1.5 text-[11px] text-slate-400 leading-relaxed">{mode.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Synthesis Title & Focus Directive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Synthesis Report Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Comparative In-Vivo Transfection & Immunogenicity Synthesis"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Custom Focus Directive or Hypothesis (Optional)
            </label>
            <input
              type="text"
              value={focusDirective}
              onChange={(e) => setFocusDirective(e.target.value)}
              placeholder="e.g., Scrutinize whether low N/P ratios compromise endosomal escape..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Focus Directive Suggestions */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400 mb-1.5">
            <Sparkles className="h-3 w-3" />
            <span>Preset Focus Directives (Click to Apply):</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FOCUS_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFocusDirective(preset)}
                className="rounded border border-slate-800 bg-slate-800/60 px-2 py-0.5 text-[11px] text-slate-300 hover:border-indigo-500/40 hover:text-white transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Execute Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting || selectedSourceIds.length < 2}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Synthesizing Multi-Source Corpus...</span>
              </>
            ) : (
              <>
                <span>Execute Cross-Source Synthesis</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
