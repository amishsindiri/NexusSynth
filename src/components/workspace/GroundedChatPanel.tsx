import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Loader2,
  Trash2,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import api from '../../api/axiosClient';

interface CitationItem {
  source_id: string;
  source_title: string;
  relevant_excerpt_or_claim: string;
}

interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: CitationItem[];
  confidence_level?: string;
  created_at: string;
}

interface GroundedChatPanelProps {
  workspaceId: string;
  workspaceTitle: string;
  researchQuestion: string;
  sourcesCount: number;
}

const confidenceConfig: Record<string, { label: string; color: string; icon: any }> = {
  HIGH_CORPUS_SUPPORT: {
    label: 'High Corpus Grounding',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: ShieldCheck,
  },
  PARTIAL_CORPUS_SUPPORT: {
    label: 'Partial Corpus Support',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: HelpCircle,
  },
  INSUFFICIENT_CORPUS_DATA: {
    label: 'Insufficient Corpus Data',
    color: 'bg-slate-700/50 text-slate-400 border-slate-600',
    icon: AlertCircle,
  },
};

export const GroundedChatPanel: React.FC<GroundedChatPanelProps> = ({
  workspaceId,
  workspaceTitle,
  researchQuestion,
  sourcesCount,
}) => {
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([
    'Which study achieved the highest endosomal escape efficiency?',
    'What are the primary methodological differences in testing protocols?',
    'Did any source evaluate repeat-dosing accelerated blood clearance?',
  ]);
  const [selectedCitation, setSelectedCitation] = useState<CitationItem | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchChatHistory = async () => {
    try {
      setIsFetchingHistory(true);
      const res = await api.get(`/workspaces/${workspaceId}/chat`);
      setMessages(res.data || []);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [workspaceId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (questionText?: string) => {
    const textToSend = questionText || inputQuestion;
    if (!textToSend || textToSend.trim().length < 3 || isLoading) return;

    setInputQuestion('');
    setError(null);

    // Optimistic user message
    const tempUserMsg: ChatMessageItem = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      setIsLoading(true);
      const res = await api.post(`/workspaces/${workspaceId}/chat`, {
        question: textToSend.trim(),
      });

      const { assistantMessage, followUpQuestions: newFollowUps } = res.data;

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        res.data.userMessage,
        assistantMessage,
      ]);

      if (newFollowUps && newFollowUps.length > 0) {
        setFollowUpQuestions(newFollowUps);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve grounded answer.');
    } finally {
      setIsLoading(false);
    }
  };

  const [error, setError] = useState<string | null>(null);

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear chat history for this workspace?')) return;
    try {
      await api.delete(`/workspaces/${workspaceId}/chat`);
      setMessages([]);
    } catch (err) {
      console.error('Error clearing chat history:', err);
    }
  };

  return (
    <div className="flex flex-col h-[750px] rounded-2xl border border-slate-800 bg-slate-900/80 shadow-lg overflow-hidden backdrop-blur-sm">
      {/* Top Chat Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Grounded Corpus Q&A Assistant</span>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                Zero-Hallucination Anchor
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Querying {sourcesCount} workspace source{sourcesCount !== 1 ? 's' : ''} with strict inline evidence citations.
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800/40 px-2.5 py-1 text-xs text-slate-400 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {isFetchingHistory ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            <p className="text-xs">Loading workspace discussion history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto p-6 space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Ask Anything About Your Ingested Corpus</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              NexusSynth AI analyzes all {sourcesCount} uploaded documents in workspace "{workspaceTitle}" to deliver verified, citation-backed answers.
            </p>
            <div className="pt-2 w-full space-y-1.5 text-left">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                Suggested exploration questions:
              </span>
              {followUpQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(q)}
                  className="w-full text-left rounded-lg border border-slate-800 bg-slate-800/40 p-2 text-xs text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-600/10 hover:text-white transition-colors"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            const citations = Array.isArray(msg.citations) ? msg.citations : [];
            const conf = msg.confidence_level ? confidenceConfig[msg.confidence_level] || confidenceConfig.HIGH_CORPUS_SUPPORT : null;
            const ConfIcon = conf?.icon;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl ${isUser ? 'ml-auto' : 'mr-auto'}`}
              >
                {/* Confidence Level Badge for Assistant */}
                {!isUser && conf && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${conf.color}`}>
                      <ConfIcon className="h-3 w-3" />
                      {conf.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-sm whitespace-pre-line'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Citations Chips for Assistant Message */}
                {!isUser && citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-400">Cited Sources:</span>
                    {citations.map((cite, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => setSelectedCitation(cite)}
                        className="inline-flex items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-950/40 px-2 py-0.5 text-[11px] font-medium text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/50 transition-colors"
                        title="Click to inspect citation claim"
                      >
                        <BookOpen className="h-3 w-3 text-indigo-400" />
                        <span className="truncate max-w-[200px]">{cite.source_title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 rounded-2xl bg-slate-800/60 p-4 border border-slate-700/60 max-w-md">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-white">Synthesizing Answer from Corpus...</p>
              <p className="text-[11px] text-slate-400">Querying Gemini 2.5 Flash with strict grounding rules...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-Up Question Chips */}
      {followUpQuestions.length > 0 && !isLoading && (
        <div className="border-t border-slate-800/80 bg-slate-950/40 px-4 py-2">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mb-1">
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>Suggested Inquiries:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {followUpQuestions.slice(0, 3).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="whitespace-nowrap rounded-lg border border-slate-800 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-indigo-500/40 hover:text-white transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="border-t border-slate-800 bg-slate-950 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={`Ask a grounded question across ${sourcesCount} workspace source${sourcesCount !== 1 ? 's' : ''}...`}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuestion.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-40 transition-colors shrink-0"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>

      {/* Citation Inspector Modal / Slide-Over */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl border border-indigo-500/40 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified Source Citation Grounding</span>
              </div>
              <button
                onClick={() => setSelectedCitation(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <Trash2 className="h-4 w-4 hidden" />
                <span>✕</span>
              </button>
            </div>
            <h4 className="text-sm font-bold text-white mb-2">{selectedCitation.source_title}</h4>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-300 leading-relaxed">
              <span className="text-[10px] text-slate-500 uppercase font-sans font-bold block mb-1">
                Extracted Grounding Excerpt:
              </span>
              "{selectedCitation.relevant_excerpt_or_claim}"
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedCitation(null)}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
