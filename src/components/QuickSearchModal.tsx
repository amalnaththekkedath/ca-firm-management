import React, { useState, useEffect } from 'react';
import { Search, X, Users, CheckSquare, Receipt, UserCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QuickSearchModal: React.FC = () => {
  const {
    isQuickSearchOpen,
    setIsQuickSearchOpen,
    clients,
    tasks,
    invoices,
    users,
    setActiveTab,
  } = useApp();

  const [term, setTerm] = useState('');

  // Handle Cmd/Ctrl + K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen(!isQuickSearchOpen);
      } else if (e.key === 'Escape' && isQuickSearchOpen) {
        setIsQuickSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickSearchOpen, setIsQuickSearchOpen]);

  if (!isQuickSearchOpen) return null;

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(term.toLowerCase()) ||
      c.gstin.toLowerCase().includes(term.toLowerCase()) ||
      c.code.toLowerCase().includes(term.toLowerCase())
  );

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(term.toLowerCase()) ||
      t.clientName.toLowerCase().includes(term.toLowerCase()) ||
      t.code.toLowerCase().includes(term.toLowerCase())
  );

  const filteredInvoices = invoices.filter(
    (i) =>
      i.invoiceNumber.toLowerCase().includes(term.toLowerCase()) ||
      i.clientName.toLowerCase().includes(term.toLowerCase())
  );

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(term.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white border border-slate-200 text-slate-900 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search Clients, GSTIN, Filing Tasks, Invoices, Staff..."
            className="w-full bg-transparent text-sm text-slate-900 focus:outline-none placeholder:text-slate-400 font-medium"
            autoFocus
          />
          <button
            onClick={() => setIsQuickSearchOpen(false)}
            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Clients Section */}
          {filteredClients.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" /> Clients ({filteredClients.length})
              </p>
              <div className="space-y-1">
                {filteredClients.slice(0, 3).map((client) => (
                  <div
                    key={client.id}
                    onClick={() => {
                      setIsQuickSearchOpen(false);
                      setActiveTab('clients');
                    }}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{client.name}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                          {client.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        GSTIN: <span className="font-mono text-slate-700">{client.gstin}</span> • {client.entityType}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {filteredTasks.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" /> Compliance Tasks ({filteredTasks.length})
              </p>
              <div className="space-y-1">
                {filteredTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setIsQuickSearchOpen(false);
                      setActiveTab('tasks');
                    }}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{task.title}</span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 border border-indigo-200 px-1.5 py-0.5 rounded font-medium">
                          {task.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Client: <span className="text-slate-700">{task.clientName}</span> • Due: {task.dueDate}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices Section */}
          {filteredInvoices.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-indigo-600" /> Invoices ({filteredInvoices.length})
              </p>
              <div className="space-y-1">
                {filteredInvoices.slice(0, 3).map((invoice) => (
                  <div
                    key={invoice.id}
                    onClick={() => {
                      setIsQuickSearchOpen(false);
                      setActiveTab('invoicing');
                    }}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{invoice.invoiceNumber}</span>
                        <span className="text-[10px] font-bold text-emerald-700 font-mono">
                          ₹{invoice.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {invoice.clientName} • Status: <span className="text-slate-700 font-semibold">{invoice.status}</span>
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {term && filteredClients.length === 0 && filteredTasks.length === 0 && filteredInvoices.length === 0 && (
            <div className="py-8 text-center text-slate-500 text-xs">
              No matching clients, tasks, or invoices found for "{term}".
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between">
          <span>Tip: Use arrow keys or click to navigate</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
