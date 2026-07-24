import React, { useState } from 'react';
import {
  Megaphone,
  Pin,
  Plus,
  Trash2,
  Calendar,
  Tag,
  AlertCircle,
  X,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NoticeCategory, NoticePriority } from '../types';

export const NoticeBoard: React.FC = () => {
  const { notices, currentUser, addNotice, deleteNotice, togglePinNotice } = useApp();

  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('COMPLIANCE');
  const [priority, setPriority] = useState<NoticePriority>('IMPORTANT');
  const [pinned, setPinned] = useState(false);

  const isPartnerOrAdmin =
    currentUser?.role === 'PARTNER' || currentUser?.role === 'ADMINISTRATOR';

  const filteredNotices = notices.filter((n) => {
    if (filterCategory === 'ALL') return true;
    return n.category === filterCategory;
  });

  const sortedNotices = [...filteredNotices].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addNotice({
      title: title.trim(),
      content: content.trim(),
      category,
      priority,
      pinned,
    });

    setIsAddModalOpen(false);
    setTitle('');
    setContent('');
    setCategory('COMPLIANCE');
    setPriority('IMPORTANT');
    setPinned(false);
  };

  const getPriorityBadge = (p: NoticePriority) => {
    switch (p) {
      case 'URGENT':
        return 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse';
      case 'IMPORTANT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'GENERAL':
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    }
  };

  const getCategoryLabel = (c: NoticeCategory) => {
    switch (c) {
      case 'COMPLIANCE':
        return 'Statutory Compliance';
      case 'CIRCULAR':
        return 'ICAI / Tax Circular';
      case 'HOLIDAY':
        return 'Holiday Notice';
      case 'OFFICE_POLICY':
        return 'Office Policy';
      case 'ANNOUNCEMENT':
      default:
        return 'General Announcement';
    }
  };

  return (
    <div className="p-6 space-y-6 text-slate-900 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-600">
              <Megaphone className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Firm Notice & Announcement Board</h1>
          </div>
          <p className="text-xs text-slate-500">
            Official announcements, statutory filing deadlines, and internal directives for all staff
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-800 focus:outline-none cursor-pointer pr-2"
            >
              <option value="ALL">All Categories</option>
              <option value="STATUTORY_DEADLINE">Statutory Deadlines</option>
              <option value="REGULATORY_UPDATE">Regulatory Updates</option>
              <option value="FIRM_POLICY">Firm Policies</option>
              <option value="INTERNAL_MEMO">Internal Memos</option>
            </select>
          </div>

          {isPartnerOrAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Post New Notice
            </button>
          )}
        </div>
      </div>

      {/* Notice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedNotices.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-3">
            <Megaphone className="w-10 h-10 mx-auto text-slate-400" />
            <p className="text-sm font-semibold">No announcements found in this category.</p>
          </div>
        ) : (
          sortedNotices.map((notice) => (
            <div
              key={notice.id}
              className={`relative bg-white border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:border-slate-300 ${
                notice.pinned
                  ? 'border-indigo-300 bg-gradient-to-b from-indigo-50/50 to-white'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded border uppercase ${getPriorityBadge(
                        notice.priority
                      )}`}
                    >
                      {notice.priority}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-indigo-600" />
                      {getCategoryLabel(notice.category)}
                    </span>
                  </div>

                  {/* Actions for Partner / Admin */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePinNotice(notice.id)}
                      className={`p-1.5 rounded-lg border transition ${
                        notice.pinned
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                      }`}
                      title={notice.pinned ? 'Unpin Notice' : 'Pin Notice to Top'}
                    >
                      <Pin className="w-3.5 h-3.5 fill-current" />
                    </button>

                    {isPartnerOrAdmin && (
                      <button
                        onClick={() => deleteNotice(notice.id)}
                        className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg transition"
                        title="Delete Notice"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-slate-900 leading-snug flex items-center gap-1.5">
                  {notice.pinned && <Pin className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />}
                  <span>{notice.title}</span>
                </h3>

                {/* Body Content */}
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {notice.content}
                </p>
              </div>

              {/* Card Footer Meta */}
              <div className="mt-5 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-indigo-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" /> {notice.authorName}
                </span>
                <span className="flex items-center gap-1 font-mono text-slate-500">
                  <Calendar className="w-3 h-3" /> {notice.createdAt}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Post Notice Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full text-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-600" /> Post New Announcement Notice
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Headline Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Urgent GST Filing Extension Circular 2026"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="COMPLIANCE">Statutory Compliance</option>
                    <option value="CIRCULAR">ICAI / Tax Circular</option>
                    <option value="HOLIDAY">Holiday Notice</option>
                    <option value="OFFICE_POLICY">Office Policy</option>
                    <option value="ANNOUNCEMENT">General Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as NoticePriority)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="GENERAL">General Priority</option>
                    <option value="IMPORTANT">Important Priority</option>
                    <option value="URGENT">URGENT Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Details / Body Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="Type full instructions, circular reference numbers, or guidelines here..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="rounded bg-white border-slate-300 text-indigo-600 focus:ring-0"
                />
                <span className="font-semibold text-amber-800 flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 fill-current text-amber-600" /> Pin this notice to top of board
                </span>
              </label>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
