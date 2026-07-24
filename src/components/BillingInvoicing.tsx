import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Printer,
  Send,
  X,
  AlertTriangle,
  Building,
  QrCode,
  FileCheck2,
  DollarSign,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FIRM_DETAILS } from '../data/mockData';
import { Invoice, InvoiceItem, InvoiceStatus } from '../types';

export const BillingInvoicing: React.FC = () => {
  const {
    invoices,
    clients,
    currentUser,
    createInvoice,
    updateInvoiceStatus,
    sendPaymentReminder,
    firmDetails,
  } = useApp();

  const currentFirm = firmDetails || FIRM_DETAILS;

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoiceView, setSelectedInvoiceView] = useState<Invoice | null>(null);

  const isPartnerOrAdmin = currentUser?.role === 'ADMINISTRATOR' || currentUser?.role === 'PARTNER';

  if (!isPartnerOrAdmin) {
    return (
      <div className="p-8 max-w-3xl mx-auto my-12 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted: Billing & Invoicing</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Tax invoice generation, fee collection, and billing controls are restricted exclusively to Managing Partners and System Administrators.
        </p>
        <div className="pt-2">
          <span className="text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600">
            Your Role: {currentUser?.role}
          </span>
        </div>
      </div>
    );
  }

  // New Invoice Form
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [outOfPocket, setOutOfPocket] = useState<number>(0);

  const [items, setItems] = useState<Omit<InvoiceItem, 'id'>[]>([
    {
      description: 'Professional Fees for Statutory Audit & Tax Compliance',
      sacCode: '998231',
      quantity: 1,
      rate: 35000,
      amount: 35000,
    },
  ]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        description: 'Professional Advisory & Retainership Fees',
        sacCode: '998222',
        quantity: 1,
        rate: 15000,
        amount: 15000,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = Number(updated.quantity) * Number(updated.rate);
        }
        return updated;
      })
    );
  };

  const calculateTotals = () => {
    const selectedClient = clients.find((c) => c.id === clientId) || clients[0];
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const isInterState = selectedClient?.state && !selectedClient.state.includes('27'); // 27 = MH

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterState) {
      igst = Math.round(subtotal * 0.18);
    } else {
      cgst = Math.round(subtotal * 0.09);
      sgst = Math.round(subtotal * 0.09);
    }

    const totalAmount = subtotal + outOfPocket + cgst + sgst + igst;

    return { subtotal, cgst, sgst, igst, totalAmount, isInterState, selectedClient };
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { subtotal, cgst, sgst, igst, totalAmount, selectedClient } = calculateTotals();

    createInvoice({
      invoiceDate,
      dueDate,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientGstin: selectedClient.gstin,
      clientPan: selectedClient.pan,
      clientAddress: selectedClient.billingAddress,
      clientState: selectedClient.state,
      placeOfSupply: selectedClient.state,
      items: items.map((it, idx) => ({ ...it, id: `itm-new-${idx}` })),
      subtotal,
      outOfPocketExpenses: Number(outOfPocket),
      cgst,
      sgst,
      igst,
      totalAmount,
      status: 'SENT',
      notes: 'Payment terms: Net 15 days. Direct NEFT / RTGS / UPI to CA Firm HDFC Account.',
    });

    setIsCreateModalOpen(false);
  };

  const filteredInvoices = invoices.filter(
    (inv) => selectedStatus === 'ALL' || inv.status === selectedStatus
  );

  return (
    <div className="p-6 space-y-6 text-slate-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-600" /> Automated GST Tax Invoicing Engine
          </h1>
          <p className="text-xs text-slate-500">
            Professional CA Tax Invoices, SAC 998222/998231, CGST/SGST/IGST & Payment Reminders
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Professional Tax Invoice
        </button>
      </div>

      {/* Filter Status Pills */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        {['ALL', 'DRAFT', 'SENT', 'OVERDUE', 'PAID'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedStatus === st
                ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-mono font-bold uppercase text-[10px]">
                <th className="p-3">Invoice No</th>
                <th className="p-3">Client Name</th>
                <th className="p-3">Date / Due</th>
                <th className="p-3">Subtotal</th>
                <th className="p-3">GST Tax</th>
                <th className="p-3">Total (INR)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono font-bold text-indigo-700">{inv.invoiceNumber}</td>
                  <td className="p-3 font-bold text-slate-900 max-w-[180px] truncate">
                    {inv.clientName}
                  </td>
                  <td className="p-3 font-mono text-slate-600">
                    {inv.invoiceDate} <span className="text-slate-400">/ {inv.dueDate}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-700">
                    ₹{inv.subtotal.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 font-mono text-indigo-700 font-semibold">
                    ₹{(inv.cgst + inv.sgst + inv.igst).toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 font-mono font-extrabold text-slate-900">
                    ₹{inv.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        inv.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : inv.status === 'OVERDUE'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                          : inv.status === 'SENT'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedInvoiceView(inv)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Printer className="w-3 h-3 text-indigo-600" /> View / Print
                    </button>

                    {inv.status !== 'PAID' && (
                      <button
                        onClick={() => updateInvoiceStatus(inv.id, 'PAID')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition"
                      >
                        Mark Paid
                      </button>
                    )}

                    {inv.status === 'OVERDUE' && (
                      <button
                        onClick={() => sendPaymentReminder(inv.id)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition"
                        title="Send Automated Reminder"
                      >
                        <Send className="w-3 h-3" /> Remind
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable CA Letterhead Tax Invoice View Modal */}
      {selectedInvoiceView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            {/* Letterhead Header */}
            <div className="border-b-2 border-indigo-900 pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black text-indigo-950 tracking-tight">
                  {currentFirm.name}
                </h1>
                <p className="text-xs font-bold text-indigo-800">{currentFirm.tagline}</p>
                <p className="text-[11px] text-slate-600 font-mono mt-0.5">{currentFirm.frn}</p>
                <p className="text-[11px] text-slate-600 mt-1 max-w-sm">{currentFirm.headOffice}</p>
                <p className="text-[11px] text-slate-600 font-mono">
                  GSTIN: {currentFirm.gstin} • PAN: {currentFirm.pan}
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block bg-indigo-900 text-white font-bold text-xs px-3 py-1 rounded uppercase tracking-wider">
                  TAX INVOICE
                </span>
                <p className="text-sm font-bold text-slate-900 font-mono mt-2">
                  {selectedInvoiceView.invoiceNumber}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Date: <strong className="font-mono">{selectedInvoiceView.invoiceDate}</strong>
                </p>
                <p className="text-xs text-slate-600">
                  Due Date: <strong className="font-mono">{selectedInvoiceView.dueDate}</strong>
                </p>
              </div>
            </div>

            {/* Billed To Address */}
            <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between text-xs">
              <div>
                <span className="font-bold text-indigo-950 uppercase tracking-wider block mb-1">
                  Billed To (Client):
                </span>
                <p className="font-extrabold text-slate-900 text-sm">{selectedInvoiceView.clientName}</p>
                <p className="text-slate-600 mt-0.5">{selectedInvoiceView.clientAddress}</p>
                <p className="text-slate-700 font-mono mt-1">
                  GSTIN: <strong>{selectedInvoiceView.clientGstin}</strong> • State: {selectedInvoiceView.clientState}
                </p>
              </div>

              <div className="text-right">
                <span className="font-bold text-indigo-950 uppercase tracking-wider block mb-1">
                  Place of Supply:
                </span>
                <p className="font-mono font-semibold text-slate-800">{selectedInvoiceView.placeOfSupply}</p>
                <span
                  className={`inline-block mt-2 font-bold px-2 py-0.5 rounded text-[10px] ${
                    selectedInvoiceView.status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {selectedInvoiceView.status}
                </span>
              </div>
            </div>

            {/* Invoice Line Items Table */}
            <table className="w-full text-left text-xs border-collapse my-4">
              <thead>
                <tr className="bg-indigo-950 text-white">
                  <th className="p-2.5 font-bold">#</th>
                  <th className="p-2.5 font-bold">Particulars / Service Description</th>
                  <th className="p-2.5 font-bold font-mono">SAC Code</th>
                  <th className="p-2.5 font-bold text-right">Qty</th>
                  <th className="p-2.5 font-bold text-right">Rate (₹)</th>
                  <th className="p-2.5 font-bold text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedInvoiceView.items.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2.5 font-mono">{index + 1}</td>
                    <td className="p-2.5 font-medium text-slate-900">{item.description}</td>
                    <td className="p-2.5 font-mono text-slate-600">{item.sacCode}</td>
                    <td className="p-2.5 text-right font-mono">{item.quantity}</td>
                    <td className="p-2.5 text-right font-mono">₹{item.rate.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono font-bold">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations Breakdown */}
            <div className="flex justify-between items-start border-t border-slate-200 pt-4 text-xs">
              {/* Payment Details & Bank Details */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 max-w-xs">
                <p className="font-bold text-indigo-950 uppercase tracking-wider">Bank Payment Account:</p>
                <p className="font-semibold text-slate-800">{currentFirm.bankName}</p>
                <p className="font-mono text-slate-700">A/C: {currentFirm.accountNo}</p>
                <p className="font-mono text-slate-700">IFSC: {currentFirm.ifsc}</p>
                <p className="font-mono text-indigo-900 font-bold">UPI ID: {currentFirm.upiId}</p>
              </div>

              <div className="space-y-1.5 text-right min-w-[200px]">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">₹{selectedInvoiceView.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {selectedInvoiceView.cgst > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (9%):</span>
                    <span className="font-mono">₹{selectedInvoiceView.cgst.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {selectedInvoiceView.sgst > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (9%):</span>
                    <span className="font-mono">₹{selectedInvoiceView.sgst.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {selectedInvoiceView.igst > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>IGST (18%):</span>
                    <span className="font-mono">₹{selectedInvoiceView.igst.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-extrabold text-sm border-t border-slate-300 pt-2">
                  <span>Total Amount Due:</span>
                  <span className="font-mono text-indigo-950">
                    ₹{selectedInvoiceView.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedInvoiceView(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold text-xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Tax Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full text-slate-900 shadow-xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" /> Create GST Tax Invoice
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Billed Client Entity
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.gstin})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Invoice Fee Line Items
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-indigo-600 hover:underline font-semibold"
                  >
                    + Add Particular
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Professional fees description..."
                          className="flex-1 bg-white border border-slate-300 rounded p-2 text-xs text-slate-900"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-rose-500 hover:text-rose-700 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 font-medium">SAC Code</label>
                          <select
                            value={item.sacCode}
                            onChange={(e) => handleItemChange(index, 'sacCode', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900"
                          >
                            <option value="998222">998222 (Legal & Accounting)</option>
                            <option value="998231">998231 (Auditing Services)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-medium">Fee Rate (₹)</label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))}
                            className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs text-slate-900 font-mono"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-medium">Amount (₹)</label>
                          <input
                            type="number"
                            value={item.amount}
                            readOnly
                            className="w-full bg-slate-100 border border-slate-200 rounded p-1.5 text-xs text-emerald-700 font-mono font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Generate & Send Tax Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
