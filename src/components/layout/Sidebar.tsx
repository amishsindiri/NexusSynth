import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  GitCompare,
  MessageSquare,
  Network,
  User,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  workspaces?: Array<{ id: string; title: string; domain: string }>;
  onOpenWorkspaceModal?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  workspaces = [],
  onOpenWorkspaceModal,
  activeTab,
  setActiveTab,
}) => {
  const { id: currentWorkspaceId } = useParams<{ id?: string }>();

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900/95 flex flex-col justify-between hidden md:flex">
      <div className="p-4 space-y-6">
        {/* Workspace Quick Action */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Workspaces
            </span>
            {onOpenWorkspaceModal && (
              <button
                onClick={onOpenWorkspaceModal}
                className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>New</span>
              </button>
            )}
          </div>

          {/* Workspaces List / Selector */}
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {workspaces.length === 0 ? (
              <div className="text-xs text-slate-500 italic p-2 rounded bg-slate-800/30">
                No active workspaces yet
              </div>
            ) : (
              workspaces.map((ws) => {
                const isActive = currentWorkspaceId === ws.id;
                return (
                  <NavLink
                    key={ws.id}
                    to={`/workspaces/${ws.id}`}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    <FolderKanban className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="truncate">{ws.title}</span>
                  </NavLink>
                );
              })
            )}
          </div>
        </div>

        {/* Workspace Command Center Navigation (Active Workspace Mode) */}
        {currentWorkspaceId && (
          <div className="border-t border-slate-800/80 pt-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Workspace Studio
            </span>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab && setActiveTab('sources')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeTab === 'sources'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>1. Sources & Ingestion</span>
              </button>

              <button
                onClick={() => setActiveTab && setActiveTab('synthesis')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeTab === 'synthesis'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <GitCompare className="h-4 w-4" />
                <span>2. Synthesis & Matrix</span>
              </button>

              <button
                onClick={() => setActiveTab && setActiveTab('chat')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>3. Grounded Q&A</span>
              </button>

              <button
                onClick={() => setActiveTab && setActiveTab('entities')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeTab === 'entities'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Network className="h-4 w-4" />
                <span>4. Entity Knowledge Graph</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Navigation */}
        <div className="border-t border-slate-800/80 pt-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Main Menu
          </span>
          <div className="space-y-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard & KPIs</span>
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <User className="h-4 w-4" />
              <span>Researcher Profile</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Engine</span>
          <span className="font-mono text-cyan-400 font-semibold">Gemini 2.5 Flash</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
          <span>Isolation</span>
          <span className="text-emerald-400">Strict Tenant RLS</span>
        </div>
      </div>
    </aside>
  );
};
