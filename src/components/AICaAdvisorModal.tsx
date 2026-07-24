import React, { useState } from 'react';
import { Bot, Send, Sparkles, Copy, Check, FileText, HelpCircle, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AICaAdvisorModal: React.FC = () => {
  const { clients, tasks, invoices } = useApp();

  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'GENERAL' | 'TAX_NOTICE' | 'BILLING_SUMMARY' | 'COMPLIANCE_CHECKLIST'>('GENERAL');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const presets = [
    {
      title: 'Draft GST Notice Reply (DRC-01)',
      prompt: 'Draft a formal legal response strategy for a GST DRC-01 notice regarding GSTR-2B vs 3B input tax credit mismatch of ₹1.45 Lakhs.',
      type: 'TAX_NOTICE' as const,
    },
    {
      title: 'Tax Audit Form 3CD Clause 44 Checklist',
      prompt: 'Explain the audit procedures and verification steps for Form 3CD Clause 44 (breakup of total expenditure into registered & unregistered GST entities).',
      type: 'COMPLIANCE_CHECKLIST' as const,
    },
    {
      title: 'Draft Invoice Notes & Fee Scope',
      prompt: 'Draft professional invoice notes for a Statutory Financial Audit and Form 3CD Tax Audit engagement for a Private Limited company with ₹12 Crore turnover.',
      type: 'BILLING_SUMMARY' as const,
    },
    {
      title: 'MCA AOC-4 & MGT-7 Penalties',
      prompt: 'Provide a quick cheat sheet on MCA AOC-4 XBRL and MGT-7 annual filing due dates, director DSC requirements, and per-day delay penalties.',
      type: 'COMPLIANCE_CHECKLIST' as const,
    },
  ];

  const handleQuery = async (queryText: string, queryType: any) => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          type: queryType,
          contextData: {
            activeClientsCount: clients.length,
            activeTasksCount: tasks.length,
            sampleClient: clients[0]?.name,
          },
        }),
      });

      const data = await res.json();
      if (data.error) {
        setResponse(`Error: ${data.error}`);
      } else {
        setResponse(data.result);
      }
    } catch (e: any) {
      setResponse(`Failed to communicate with AI CA Advisor: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!response) return;
    navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 text-slate-900 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-5 rounded-2xl border border-indigo-700 shadow-md flex items-center justify-between text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-white/20 text-white border border-white/30 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-200" /> GEMINI 3.6 FLASH CA ASSISTANT
            </span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            AI CA Advisor & Tax Scrutiny Copilot
          </h1>
          <p className="text-xs text-indigo-100 mt-0.5">
            Instant guidance on Income Tax, GST DRC notices, Tax Audit 3CD clauses, MCA ROC & Fee drafting
          </p>
        </div>

        <Bot className="w-10 h-10 text-indigo-200 opacity-90 hidden sm:block" />
      </div>

      {/* Preset Prompts Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setPrompt(preset.prompt);
              setType(preset.type);
              handleQuery(preset.prompt, preset.type);
            }}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 rounded-xl text-left transition space-y-1 shadow-xs"
          >
            <span className="text-xs font-bold text-indigo-700 block">{preset.title}</span>
            <p className="text-[11px] text-slate-500 line-clamp-2">{preset.prompt}</p>
          </button>
        ))}
      </div>

      {/* Query Input Box */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-xs">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything on Income Tax, GST DRC-01, Form 3CD clauses, Statutory Audits, or CA Practice Management..."
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 h-24"
        />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Powered by Gemini 3.6 Flash Server-Side API
          </span>
          <button
            onClick={() => handleQuery(prompt, type)}
            disabled={loading || !prompt.trim()}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            {loading ? (
              <span className="animate-spin text-xs">🌀 Processing...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Consult AI Advisor
              </>
            )}
          </button>
        </div>
      </div>

      {/* Response Box */}
      {response && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-600" /> AI Advisor Response & Strategic Guidance
            </h3>
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium flex items-center gap-1 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Response'}
            </button>
          </div>

          <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans font-normal">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};
