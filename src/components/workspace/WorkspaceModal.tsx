import React, { useState } from 'react';
import { X, Sparkles, FolderPlus, Loader2 } from 'lucide-react';
import api from '../../api/axiosClient';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceCreated: (workspace: any) => void;
}

const TEMPLATES = [
  {
    label: 'Biotech mRNA Delivery',
    domain: 'CLINICAL_BIOTECH',
    title: 'Ester-Cleavable LNPs & Primate Tolerability',
    research_question: 'How do biodegradable ester linkages in ionizable lipids impact repeat-dosing immunogenicity and hepatic clearance kinetics?',
    description: 'Investigating trade-offs between endosomal escape efficacy and long-term tolerability in mRNA therapeutic vectors.',
  },
  {
    label: 'Deep Tech & AI Systems',
    domain: 'TECH_ENGINEERING',
    title: 'Test-Time Compute vs Pre-training Scaling Laws',
    research_question: 'Does increasing inference-time search budget yield Pareto-optimal performance over autoregressive parameter scaling for complex reasoning?',
    description: 'Evaluating architectural shifts toward test-time verification, Monte Carlo Tree Search, and process reward models.',
  },
  {
    label: 'Market & Semiconductor',
    domain: 'MARKET_COMPETITIVE',
    title: 'High-Bandwidth Memory (HBM3e/HBM4) Supply Chains',
    research_question: 'What are the competitive bottleneck dynamics between TSMC CoWoS packaging and memory yield limits through 2027?',
    description: 'Analyzing fab capacity, substrate lead times, and thermal dissipation constraints for next-generation AI accelerators.',
  },
  {
    label: 'Policy & Regulatory',
    domain: 'POLICY_REGULATORY',
    title: 'EU AI Act High-Risk Model Auditing Frameworks',
    research_question: 'What empirical testing protocols reliably satisfy Article 53 obligations for systemic risk governance in frontier multimodal models?',
    description: 'Synthesis of European Commission guidelines, technical red-teaming standards, and algorithmic transparency mandates.',
  },
];

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  onWorkspaceCreated,
}) => {
  const [title, setTitle] = useState('');
  const [domain, setDomain] = useState('ACADEMIC_SCIENTIFIC');
  const [researchQuestion, setResearchQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setDomain(tmpl.domain);
    setResearchQuestion(tmpl.research_question);
    setDescription(tmpl.description);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters.');
      return;
    }
    if (researchQuestion.trim().length < 10) {
      setError('Research question must be at least 10 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/workspaces', {
        title: title.trim(),
        domain,
        research_question: researchQuestion.trim(),
        description: description.trim() || null,
      });

      onWorkspaceCreated(res.data);
      onClose();
      // Reset form
      setTitle('');
      setResearchQuestion('');
      setDescription('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create workspace. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create Research Workspace</h2>
              <p className="text-xs text-slate-400">Establish an isolated domain-specific corpus and synthesis environment.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick-Fill Sample Templates */}
        <div className="my-4 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>1-Click Sample Research Templates:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className="rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1 text-xs text-slate-300 transition-colors hover:border-indigo-500/50 hover:bg-indigo-600/10 hover:text-indigo-300"
              >
                {tmpl.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Workspace Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., mRNA Delivery Vectors & Biodegradable LNPs"
              required
              maxLength={150}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Domain */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Target Research Domain <span className="text-rose-400">*</span>
            </label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ACADEMIC_SCIENTIFIC">Academic & Scientific Literature (STEM, Peer-Reviewed)</option>
              <option value="CLINICAL_BIOTECH">Clinical Trials, Healthcare & Biomedical Research</option>
              <option value="MARKET_COMPETITIVE">Market Intelligence, Consumer Insights & Product Strategy</option>
              <option value="POLICY_REGULATORY">Public Policy, Legal Frameworks & Regulatory Compliance</option>
              <option value="TECH_ENGINEERING">Software Architecture, AI Systems & Deep Tech R&D</option>
              <option value="FINANCIAL_MACRO">Macroeconomic Trends, Equity Research & Risk Analysis</option>
            </select>
          </div>

          {/* Research Question */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Core Guiding Research Question <span className="text-rose-400">*</span>
            </label>
            <textarea
              value={researchQuestion}
              onChange={(e) => setResearchQuestion(e.target.value)}
              placeholder="What core scientific or analytical question will guide all AI synthesis and contradiction detection across ingested sources in this workspace?"
              rows={3}
              required
              maxLength={1000}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Scope & Methodology Notes (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context regarding target journals, clinical phases, sample sizes, or inclusion criteria..."
              rows={2}
              maxLength={2000}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Initializing Workspace...</span>
                </>
              ) : (
                <span>Create Workspace</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
