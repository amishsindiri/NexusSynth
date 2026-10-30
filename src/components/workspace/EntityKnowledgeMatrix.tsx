import React, { useState, useMemo } from 'react';
import { Network, Search, Tag, FileText, Filter, Sparkles, CheckCircle2 } from 'lucide-react';
import { SourceItem } from './SourceCard';

interface EntityKnowledgeMatrixProps {
  sources: SourceItem[];
}

interface EntityOccurrence {
  name: string;
  count: number;
  sources: Array<{ id: string; title: string; year?: number }>;
}

export const EntityKnowledgeMatrix: React.FC<EntityKnowledgeMatrixProps> = ({ sources }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<EntityOccurrence | null>(null);

  // Aggregate all entities across all sources in this workspace
  const entityMap = useMemo(() => {
    const map = new Map<string, EntityOccurrence>();

    sources.forEach((s) => {
      const entities = Array.isArray(s.entities) ? s.entities : [];
      entities.forEach((rawEnt) => {
        const normalized = rawEnt.trim();
        if (!normalized) return;

        if (!map.has(normalized)) {
          map.set(normalized, {
            name: normalized,
            count: 0,
            sources: [],
          });
        }

        const entry = map.get(normalized)!;
        entry.count += 1;
        if (!entry.sources.some((src) => src.id === s.id)) {
          entry.sources.push({
            id: s.id,
            title: s.title,
            year: s.publication_year,
          });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [sources]);

  const filteredEntities = useMemo(() => {
    if (!searchQuery.trim()) return entityMap;
    const q = searchQuery.toLowerCase();
    return entityMap.filter((e) => e.name.toLowerCase().includes(q));
  }, [entityMap, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cross-Document Entity & Concept Matrix</h3>
              <p className="text-xs text-slate-400">
                Explore normalized domain entities, biomarkers, frameworks, and technologies mapped across your workspace corpus.
              </p>
            </div>
          </div>

          {/* Search Filter */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter concepts..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Visual Concept Tag Cloud */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Aggregated Concept Tag Cloud ({filteredEntities.length} Total Entities Identified)
          </span>

          {filteredEntities.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-4 rounded-xl border border-slate-800 bg-slate-950/40">
              No matching concepts found. Ingest more research documents to enrich the knowledge graph.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {filteredEntities.map((ent) => {
                const isSelected = selectedEntity?.name === ent.name;
                const isHighFrequency = ent.count > 1;

                return (
                  <button
                    key={ent.name}
                    onClick={() => setSelectedEntity(isSelected ? null : ent)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                        : isHighFrequency
                        ? 'border-indigo-500/40 bg-indigo-950/40 text-cyan-300 hover:border-cyan-400'
                        : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <Tag className="h-3 w-3" />
                    <span>{ent.name}</span>
                    <span
                      className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                        isSelected
                          ? 'bg-indigo-800 text-white'
                          : isHighFrequency
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {ent.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected Entity Deep-Dive Card */}
      {selectedEntity && (
        <div className="rounded-2xl border border-indigo-500/40 bg-indigo-950/20 p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-indigo-800/40 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">
                Concept Occurrences: <span className="text-cyan-300">"{selectedEntity.name}"</span>
              </h4>
            </div>
            <span className="text-xs font-semibold text-indigo-300">
              Found in {selectedEntity.sources.length} document{selectedEntity.sources.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {selectedEntity.sources.map((src) => (
              <div
                key={src.id}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs"
              >
                <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="truncate">{src.title}</span>
                </div>
                {src.year && <p className="text-[11px] text-slate-400">Published: {src.year}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cross-Document Occurrence Matrix Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Concept Co-Occurrence Across Ingested Documents
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-2.5">Domain Entity / Keyword</th>
                <th className="px-4 py-2.5 text-center">Frequency</th>
                <th className="px-4 py-2.5">Corpus Documents Documenting This Concept</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredEntities.slice(0, 15).map((ent, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="px-4 py-2.5 font-semibold text-white">{ent.name}</td>
                  <td className="px-4 py-2.5 text-center font-mono">
                    <span className="rounded bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 text-indigo-300 font-bold">
                      {ent.count}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {ent.sources.map((s, i) => (
                        <span key={i} className="rounded bg-slate-800 border border-slate-700/60 px-2 py-0.5 text-[11px] text-slate-300">
                          {s.title.substring(0, 45)}...
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
