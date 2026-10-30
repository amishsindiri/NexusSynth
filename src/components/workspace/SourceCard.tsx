import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Calendar,
  User,
  ExternalLink,
  Trash2,
  Tag,
  Hash,
  Eye,
  CheckSquare,
  Square,
} from 'lucide-react';

export interface SourceItem {
  id: string;
  workspace_id: string;
  title: string;
  authors?: string;
  publication_year?: number;
  source_type: string;
  source_url?: string;
  word_count?: number;
  ai_summary?: string;
  methodology_notes?: string;
  limitations?: string;
  key_claims?: any[];
  entities?: string[];
  key_metrics?: any[];
  created_at: string;
}

interface SourceCardProps {
  source: SourceItem;
  workspaceId: string;
  onDelete?: (sourceId: string) => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (sourceId: string) => void;
}

const sourceTypeLabels: Record<string, string> = {
  PEER_REVIEWED_PAPER: 'Peer-Reviewed Paper',
  TECHNICAL_REPORT: 'Technical Report',
  POLICY_BRIEF: 'Policy Brief',
  MARKET_ANALYSIS: 'Market Analysis',
  RAW_FIELD_NOTES: 'Field Notes',
  WEB_ARTICLE_TRANSCRIPT: 'Article / Transcript',
};

export const SourceCard: React.FC<SourceCardProps> = ({
  source,
  workspaceId,
  onDelete,
  selectable = false,
  isSelected = false,
  onToggleSelect,
}) => {
  const claims = Array.isArray(source.key_claims) ? source.key_claims : [];
  const entities = Array.isArray(source.entities) ? source.entities : [];

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border bg-slate-900/80 p-5 shadow-sm transition-all hover:bg-slate-900 ${
        isSelected
          ? 'border-indigo-500 shadow-indigo-500/10 ring-1 ring-indigo-500'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div>
        {/* Header: Type Pill & Selectable Checkbox */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            {selectable && (
              <button
                type="button"
                onClick={() => onToggleSelect && onToggleSelect(source.id)}
                className="text-slate-400 hover:text-white transition-colors"
                title={isSelected ? 'Deselect source' : 'Select source for synthesis'}
              >
                {isSelected ? (
                  <CheckSquare className="h-4 w-4 text-indigo-400" />
                ) : (
                  <Square className="h-4 w-4 text-slate-600" />
                )}
              </button>
            )}
            <span className="rounded-md border border-slate-700/80 bg-slate-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
              {sourceTypeLabels[source.source_type] || source.source_type}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {source.source_url && (
              <a
                href={source.source_url}
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-slate-300 transition-colors"
                title="View original publication"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(source.id)}
                className="text-slate-500 hover:text-rose-400 transition-colors"
                title="Delete document"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
          {source.title}
        </h3>

        {/* Authors & Year */}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3 text-slate-500" />
            <span className="truncate max-w-[160px]">{source.authors || 'Unknown'}</span>
          </div>
          {source.publication_year && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-500" />
              <span>{source.publication_year}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Hash className="h-3 w-3" />
            <span>{source.word_count || 0} words</span>
          </div>
        </div>

        {/* AI Summary Preview */}
        {source.ai_summary && (
          <p className="mt-3 text-xs text-slate-300 line-clamp-3 leading-relaxed">
            {source.ai_summary}
          </p>
        )}

        {/* Concept / Entity Badges Preview */}
        {entities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {entities.slice(0, 4).map((ent, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 text-[10px] font-medium text-slate-300"
              >
                <Tag className="h-2.5 w-2.5 text-indigo-400" />
                {ent}
              </span>
            ))}
            {entities.length > 4 && (
              <span className="text-[10px] text-slate-500 font-medium self-center">
                +{entities.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Info & Deep-Dive Link */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px] font-medium">
          <span className="font-semibold text-emerald-400">{claims.length}</span> Claims Extracted
        </span>

        <Link
          to={`/workspaces/${workspaceId}/sources/${source.id}`}
          className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Inspect Document</span>
        </Link>
      </div>
    </div>
  );
};
