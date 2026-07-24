import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Shield,
  Search,
  UserCheck,
  Circle,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InternalMessaging: React.FC = () => {
  const { internalMessages, users, currentUser, sendInternalMessage } = useApp();

  if (!currentUser) return null;

  // Filter out current logged in user from list of potential chat partners
  const otherStaff = users.filter((u) => u.id !== currentUser.id);

  const [selectedUserId, setSelectedUserId] = useState<string>(
    otherStaff[0]?.id || ''
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [text, setText] = useState('');

  const selectedUser = users.find((u) => u.id === selectedUserId) || otherStaff[0];

  const filteredStaff = otherStaff.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter 1-on-1 messages between currentUser and selectedUser
  const directMessages = internalMessages.filter((m) => {
    if (!selectedUser) return false;
    const isSentToSelected =
      m.senderId === currentUser.id && m.recipientId === selectedUser.id;
    const isReceivedFromSelected =
      m.senderId === selectedUser.id && m.recipientId === currentUser.id;
    return isSentToSelected || isReceivedFromSelected;
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;

    sendInternalMessage(selectedUser.id, text.trim());
    setText('');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'PARTNER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMINISTRATOR':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AUDIT_MANAGER':
      case 'SENIOR_MANAGER':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'AUDIT_SENIOR':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'ARTICLE_ASSISTANT':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-6 space-y-6 text-slate-900 max-w-7xl mx-auto h-[calc(100vh-5rem)] flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <span className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-600">
            <MessageSquare className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Individual Direct Messaging Board
            </h1>
            <p className="text-xs text-slate-500">
              1-on-1 private messaging between firm partners, managers, audit seniors, and article assistants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-mono">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Encrypted Internal Network</span>
        </div>
      </div>

      {/* Main Messaging Interface Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left Sidebar - Staff Directory List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-sm">
          <div className="space-y-3 flex flex-col h-full min-h-0">
            <div className="px-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Staff Members ({otherStaff.length})</span>
              </span>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search staff by name or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Staff List */}
            <div className="space-y-1 overflow-y-auto flex-1 pr-1">
              {filteredStaff.map((staff) => {
                const isActive = selectedUserId === staff.id;
                // Count total messages with this staff
                const msgCount = internalMessages.filter(
                  (m) =>
                    (m.senderId === currentUser.id && m.recipientId === staff.id) ||
                    (m.senderId === staff.id && m.recipientId === currentUser.id)
                ).length;

                return (
                  <button
                    key={staff.id}
                    onClick={() => setSelectedUserId(staff.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs transition border ${
                      isActive
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-medium'
                        : 'border-transparent hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={staff.avatar}
                        alt={staff.name}
                        className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                      />
                      <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500 absolute -bottom-0.5 -right-0.5" />
                    </div>

                    <div className="text-left flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-slate-900 truncate text-[11px]">{staff.name}</p>
                        {msgCount > 0 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-mono font-bold">
                            {msgCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate font-mono">{staff.designation}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Area - Direct Chat Window */}
        <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between min-h-0 overflow-hidden shadow-sm">
          {/* Active Recipient Header Bar */}
          {selectedUser ? (
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-9 h-9 rounded-xl object-cover border border-indigo-200"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-900">{selectedUser.name}</h2>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded border uppercase font-semibold ${getRoleBadge(
                        selectedUser.role
                      )}`}
                    >
                      {selectedUser.role.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {selectedUser.designation} • {selectedUser.email}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-semibold">
                  Online Direct Channel
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-500">
              Select a staff member to start direct messaging
            </div>
          )}

          {/* Messages Feed Box */}
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            {directMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                <MessageSquare className="w-10 h-10 opacity-30 text-indigo-600" />
                <p className="text-xs font-medium text-slate-600">No 1-on-1 messages with {selectedUser?.name || 'this user'} yet.</p>
                <p className="text-[11px] text-slate-400">Send a direct message below to start private coordination.</p>
              </div>
            ) : (
              directMessages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0"
                    />

                    <div className={`max-w-md space-y-1 ${isMe ? 'items-end text-right' : ''}`}>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="font-bold text-slate-800">{msg.senderName}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${getRoleBadge(
                            msg.senderRole
                          )}`}
                        >
                          {msg.senderRole}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">{msg.createdAt}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                            : 'bg-slate-100 border border-slate-200 text-slate-900 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input Box */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Send private message to ${selectedUser?.name || 'staff member'}...`}
              className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!text.trim() || !selectedUser}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
