import React from 'react';
import { ShieldCheck, HelpCircle, AlertTriangle } from 'lucide-react';

export interface EmpiricalClaim {
  claim: string;
  supporting_evidence: string;
  confidence: 'HIGH' | 'MODERATE' | 'SPECULATIVE' | string;
  relevance_to_workspace: string;
}

interface ClaimBadgeListProps {
  claims: EmpiricalClaim[];
  compact?: boolean;
}

const confidenceConfig: Record<string, { label: string; badge: string; border: string; icon: any }> = {
  HIGH: {
    label: 'High Confidence',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    border: 'border-l-emerald-500',
    icon: ShieldCheck,
  },
  MODERATE: {
    label: 'Moderate Evidence',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    border: 'border-l-amber-500',
    icon: HelpCircle,
  },
  SPECULATIVE: {
    label: 'Speculative / Preliminary',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    border: 'border-l-rose-500',
    icon: AlertTriangle,
  },
};

export const ClaimBadgeList: React.FC<ClaimBadgeListProps> = ({ claims = [], compact = false }) => {
  if (claims.length === 0) {
    return <p className="text-xs text-slate-500 italic">No empirical claims extracted for this document.</p>;
  }

  return (
    <div className="space-y-3">
      {claims.map((claimObj, idx) => {
        const conf = confidenceConfig[claimObj.confidence] || confidenceConfig.MODERATE;
        const IconComponent = conf.icon;

        if (compact) {
          return (
            <div
              key={idx}
              className={`rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 text-xs border-l-4 ${conf.border}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${conf.badge}`}>
                  <IconComponent className="h-3 w-3" />
                  {conf.label}
                </span>
              </div>
              <p className="font-medium text-slate-200">{claimObj.claim}</p>
            </div>
          );
        }

        return (
          <div
            key={idx}
            className={`rounded-xl border border-slate-800/80 bg-slate-900/80 p-4 transition-all hover:border-slate-700 border-l-4 ${conf.border}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${conf.badge}`}>
                <IconComponent className="h-3.5 w-3.5" />
                {conf.label}
              </span>
              {claimObj.relevance_to_workspace && (
                <span className="text-[11px] font-medium text-indigo-400 bg-indigo-950/40 border border-indigo-800/40 rounded px-2 py-0.5">
                  Relevance: {claimObj.relevance_to_workspace}
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-white leading-snug">{claimObj.claim}</p>

            {claimObj.supporting_evidence && (
              <div className="mt-2.5 rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60 text-xs text-slate-300">
                <span className="font-semibold text-slate-400 block mb-1">Supporting Empirical Grounding:</span>
                <p className="italic text-slate-300 leading-relaxed font-serif">"{claimObj.supporting_evidence}"</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
