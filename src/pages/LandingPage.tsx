import React from 'react';
import { Link } from 'react-router-dom';
import {
  FlaskConical,
  GitCompare,
  FileSearch,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  Activity,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 shadow-md shadow-indigo-500/20">
              <FlaskConical className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              NexusSynth<span className="text-cyan-400">.AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-cyan-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1 text-xs font-medium text-cyan-300 mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Enterprise Multi-Source Research Synthesis & Contradiction Discovery</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Synthesize Scientific Literature.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Detect Empirical Contradictions.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            NexusSynth AI eliminates information fragmentation for academic investigators, clinical R&D leads, and strategic analysts. Ingest PDFs or literature, extract verifiable empirical claims, map methodology divergences, and chat with a strictly grounded assistant.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-7 py-3 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-400 transition-all"
            >
              <span>Launch Live Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login?demo=true"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-all"
            >
              <span>Explore Pre-Seeded Demo</span>
              <Sparkles className="h-4 w-4 text-cyan-400" />
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <span className="block text-2xl font-black text-white">100%</span>
              <span className="text-xs text-slate-400">Inline Citation Grounding</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <span className="block text-2xl font-black text-cyan-400">Gemini 2.5</span>
              <span className="text-xs text-slate-400">High-Context Reasoning</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <span className="block text-2xl font-black text-emerald-400">PostgreSQL</span>
              <span className="text-xs text-slate-400">Tenant-Isolated RLS</span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
              <span className="block text-2xl font-black text-purple-400">Zero</span>
              <span className="text-xs text-slate-400">External Hallucination</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Core Cognitive Workflows */}
      <section className="py-20 border-t border-slate-800/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
              Cognitive Architecture
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Four High-Value Analytical Pillars
            </h3>
            <p className="mt-3 text-sm text-slate-400">
              Designed from first principles to turn disparate academic papers into structured, comparative intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
                  <FileSearch className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">Automated Source Indexing</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Extracts PDF text via <code className="text-slate-300">pdf-parse</code> and deconstructs papers into structured claims, methodology critique, limitations, and entities using Gemini.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-semibold text-blue-400">
                Confidence-Rated Claims
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-4">
                  <GitCompare className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">Cross-Source Synthesis Matrix</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Synthesizes 2 to 10 sources simultaneously into an aligned evidence matrix, tracking metrics across dimensions with strict inline source attribution.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-semibold text-purple-400">
                Comparative Evidence Tables
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
                  <Activity className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">Contradiction & Gap Engine</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Detects empirical disagreements between authors, isolates root methodological discrepancies, and flags unexplored high-priority research gaps.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-semibold text-rose-400">
                Methodological Divergence
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-colors">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-2">Grounded Corpus Q&A</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive dialogue anchored strictly in your workspace corpus. Returns clickable citation badges and refuses to hallucinate facts outside your uploaded documents.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] font-semibold text-emerald-400">
                Verifiable Source Citations
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Domains */}
      <section className="py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-xl sm:text-2xl font-bold text-white">Built for Specialized Research Domains</h3>
            <p className="text-xs text-slate-400 mt-1">Configurable taxonomy and evaluation parameters per discipline</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Academic & Scientific', desc: 'Peer-reviewed STEM literature' },
              { name: 'Clinical & Biotech', desc: 'Trial kinetics & pharmacology' },
              { name: 'Market & Competitive', desc: 'Supply chains & strategic briefs' },
              { name: 'Policy & Regulatory', desc: 'Legal compliance & EU AI Act' },
              { name: 'Tech & Engineering', desc: 'Model architectures & systems' },
              { name: 'Macro & Financial', desc: 'Quantitative risk & equity reports' },
            ].map((d, i) => (
              <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 text-center">
                <span className="block text-xs font-bold text-white">{d.name}</span>
                <span className="block text-[10px] text-slate-400 mt-1">{d.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">NexusSynth AI</span>
            <span>— Enterprise Multi-Source Knowledge Synthesis</span>
          </div>
          <div>
            <span>Powered by Google Gemini 2.5 Flash & PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
