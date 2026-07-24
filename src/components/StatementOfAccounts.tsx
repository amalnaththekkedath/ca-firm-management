import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Search,
  Building,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Download,
  CreditCard,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Client, Invoice, SoaTransaction } from '../types';
import { FIRM_DETAILS } from '../data/mockData';

export const StatementOfAccounts: React.FC = () => {
  const { clients, invoices, currentUser, firmDetails } = useApp();

  const currentFirm = firmDetails || FIRM_DETAILS;

  const [selectedClientId, setSelectedClientId] = useState<string>(clients[0]?.id || '');
  const [selectedFy, setSelectedFy] = useState<string>('2025-2026');
  const [searchClient, setSearchClient] = useState<string>('');

  const isPartnerOrAdmin = currentUser?.role === 'ADMINISTRATOR' || currentUser?.role === 'PARTNER';

  if (!isPartnerOrAdmin) {
    return (
      <div className="p-8 max-w-3xl mx-auto my-12 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted: Statement of Accounts</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Client Statement of Accounts ledgers and financial balances are confidential and restricted strictly to Managing Partners and System Administrators.
        </p>
        <div className="pt-2">
          <span className="text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
            Your Role: {currentUser?.role}
          </span>
        </div>
      </div>
    );
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Filter clients for dropdown/search
  const matchingClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchClient.toLowerCase()) ||
      c.code.toLowerCase().includes(searchClient.toLowerCase()) ||
      c.pan.toLowerCase().includes(searchClient.toLowerCase()) ||
      c.gstin.toLowerCase().includes(searchClient.toLowerCase())
  );

  // Compute SOA ledger transactions for selected client
  const clientInvoices = invoices.filter((inv) => inv.clientId === selectedClient?.id);

  // Build Chronological Transactions
  const buildSoaTransactions = (): SoaTransaction[] => {
    const rawTxns: Array<{
      id: string;
      date: string;
      voucherType: 'INVOICE' | 'PAYMENT' | 'CREDIT_NOTE' | 'RETAINER_CREDIT' | 'OPENING_BALANCE';
      referenceNo: string;
      particulars: string;
      debit: number;
      credit: number;
    }> = [];

    // 1. Opening Balance Entry
    const opBal = selectedClient?.openingBalance ?? 0;
    const isOpBalDr = (selectedClient?.openingBalanceType || 'DR') === 'DR';
    const opBalDate = selectedClient?.openingBalanceDate || `${selectedFy.split('-')[0]}-04-01`;

    rawTxns.push({
      id: `tx-opbal-${selectedClient?.id || 'default'}`,
      date: opBalDate,
      voucherType: 'OPENING_BALANCE',
      referenceNo: 'OPB-2025',
      particulars: `Opening Balance Brought Forward (${isOpBalDr ? 'Debit / Receivable' : 'Credit / Advance'})`,
      debit: isOpBalDr ? opBal : 0,
      credit: !isOpBalDr ? opBal : 0,
    });

    // 2. Invoices & Payments
    clientInvoices.forEach((inv) => {
      // Invoice Debit Entry
      const itemsSummary = inv.items.map((i) => i.description).join(', ');
      rawTxns.push({
        id: `tx-inv-${inv.id}`,
        date: inv.invoiceDate,
        voucherType: 'INVOICE',
        referenceNo: inv.invoiceNumber,
        particulars: `Tax Invoice Billed: ${itemsSummary || 'Professional Fees'}`,
        debit: inv.totalAmount,
        credit: 0,
      });

      // Payment Credit Entry if Paid
      if (inv.status === 'PAID' && inv.paymentDate) {
        rawTxns.push({
          id: `tx-pay-${inv.id}`,
          date: inv.paymentDate,
          voucherType: 'PAYMENT',
          referenceNo: inv.paymentReference || 'NEFT/RTGS',
          particulars: `Payment Received against ${inv.invoiceNumber} (${inv.paymentReference || 'Bank Transfer'})`,
          debit: 0,
          credit: inv.totalAmount,
        });
      }
    });

    // Sort by date ascending
    rawTxns.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Compute running balance
    let currentBalance = 0; // Debit positive
    const result: SoaTransaction[] = rawTxns.map((tx) => {
      currentBalance = currentBalance + tx.debit - tx.credit;
      return {
        ...tx,
        runningBalance: currentBalance,
      };
    });

    return result;
  };

  const ledger = buildSoaTransactions();

  const totalBilled = ledger.reduce((acc, curr) => acc + curr.debit, 0);
  const totalReceived = ledger.reduce((acc, curr) => acc + curr.credit, 0);
  const netOutstanding = totalBilled - totalReceived;

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 text-slate-900 max-w-7xl mx-auto">
      {/* Non-printable screen header & filters */}
      <div className="print:hidden space-y-4">
        {/* Top Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" /> Statement of Accounts (SOA) Ledger
            </h1>
            <p className="text-xs text-slate-500">
              Professional client ledger statement, debit/credit audit trail & outstanding balance tracking
            </p>
          </div>

          <button
            onClick={handlePrintPdf}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0"
          >
            <Printer className="w-4 h-4" /> Print / Export SOA PDF
          </button>
        </div>

        {/* Client Selection Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Client Entity
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name} ({c.pan})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Financial Year Period
            </label>
            <select
              value={selectedFy}
              onChange={(e) => setSelectedFy(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="2025-2026">FY 2025-2026 (Apr 2025 - Mar 2026)</option>
              <option value="2026-2027">FY 2026-2027 (Apr 2026 - Mar 2027)</option>
              <option value="ALL">All Time Statement</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Quick Filter Clients
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchClient}
                onChange={(e) => setSearchClient(e.target.value)}
                placeholder="Search PAN or Client Name..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PRINTABLE STATEMENT CONTAINER (Renders both on screen and in print) */}
      <div className="bg-white text-slate-900 rounded-2xl p-8 border border-slate-200 shadow-xl print:shadow-none print:border-none print:p-0 print:m-0 print:text-black">
        {/* Printable Firm Letterhead Header */}
        <div className="border-b-2 border-slate-800 pb-6 mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-slate-900 text-white rounded-lg font-bold text-lg font-mono print:hidden">
                RK
              </span>
              <div>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                  {currentFirm.name}
                </h1>
                <p className="text-xs font-semibold text-indigo-950">{currentFirm.tagline}</p>
              </div>
            </div>

            <div className="mt-3 text-xs text-slate-600 space-y-0.5">
              <p className="font-semibold">{currentFirm.headOffice}</p>
              <p>
                <span className="font-bold text-slate-800">{currentFirm.frn}</span> • GSTIN:{' '}
                <span className="font-mono font-bold text-slate-800">{currentFirm.gstin}</span>
              </p>
              <p>Email: {currentFirm.email} • Tel: {currentFirm.phone}</p>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <span className="bg-slate-900 text-white font-mono text-xs font-bold px-3 py-1 rounded">
              STATEMENT OF ACCOUNTS
            </span>
            <div className="mt-2 text-xs text-slate-600 font-mono text-right space-y-1">
              <p>
                Statement Date:{' '}
                <span className="font-bold text-slate-900">
                  {new Date().toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </p>
              <p>
                Period: <span className="font-bold text-slate-900">{selectedFy}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Client Account Info & Address Block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200 mb-6 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              To Client Account:
            </span>
            <h2 className="text-base font-bold text-slate-900">{selectedClient?.name}</h2>
            {selectedClient?.tradeName && (
              <p className="text-slate-600 italic">Trade Name: {selectedClient.tradeName}</p>
            )}
            <p className="text-slate-700 mt-2 font-medium">{selectedClient?.billingAddress}</p>
            <p className="text-slate-600 mt-1">
              State: <span className="font-semibold text-slate-900">{selectedClient?.state}</span>
            </p>
          </div>

          <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-6">
            <div className="flex justify-between">
              <span className="text-slate-500">Client Code:</span>
              <span className="font-mono font-bold text-indigo-900">{selectedClient?.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">GSTIN:</span>
              <span className="font-mono font-bold text-slate-900">{selectedClient?.gstin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">PAN:</span>
              <span className="font-mono font-semibold text-slate-900">{selectedClient?.pan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Partner-in-Charge:</span>
              <span className="font-semibold text-slate-900">
                {selectedClient?.partnerInChargeName || 'CA Rajesh Kapoor'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Key Contact:</span>
              <span className="font-medium text-slate-800">{selectedClient?.contactPerson}</span>
            </div>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-slate-900">
          <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Fee Billed (Debit)
            </span>
            <span className="text-lg font-mono font-black text-slate-900 mt-1 block">
              ₹{totalBilled.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              Total Realized (Credit)
            </span>
            <span className="text-lg font-mono font-black text-emerald-900 mt-1 block">
              ₹{totalReceived.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
              Net Balance Outstanding
            </span>
            <span
              className={`text-lg font-mono font-black mt-1 block ${
                netOutstanding > 0 ? 'text-indigo-900' : 'text-emerald-800'
              }`}
            >
              ₹{Math.abs(netOutstanding).toLocaleString('en-IN')} {netOutstanding >= 0 ? 'Dr' : 'Cr'}
            </span>
          </div>
        </div>

        {/* Ledger Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold uppercase text-[10px] tracking-wider">
                <th className="p-3 border border-slate-800">Date</th>
                <th className="p-3 border border-slate-800">Voucher Type</th>
                <th className="p-3 border border-slate-800">Ref / Inv No.</th>
                <th className="p-3 border border-slate-800">Particulars</th>
                <th className="p-3 border border-slate-800 text-right">Debit (₹)</th>
                <th className="p-3 border border-slate-800 text-right">Credit (₹)</th>
                <th className="p-3 border border-slate-800 text-right">Running Bal (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {ledger.map((tx) => (
                <tr
                  key={tx.id}
                  className={`hover:bg-slate-50 transition ${
                    tx.voucherType === 'OPENING_BALANCE' ? 'bg-amber-50/50 font-medium' : ''
                  }`}
                >
                  <td className="p-3 border border-slate-200 font-mono text-slate-700">{tx.date}</td>
                  <td className="p-3 border border-slate-200">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.voucherType === 'OPENING_BALANCE'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : tx.voucherType === 'INVOICE'
                          ? 'bg-blue-100 text-blue-900 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      }`}
                    >
                      {tx.voucherType === 'OPENING_BALANCE' ? 'OPENING BAL' : tx.voucherType}
                    </span>
                  </td>
                  <td className="p-3 border border-slate-200 font-mono font-bold text-slate-900">
                    {tx.referenceNo}
                  </td>
                  <td className="p-3 border border-slate-200 font-medium text-slate-800 max-w-xs">
                    {tx.particulars}
                  </td>
                  <td className="p-3 border border-slate-200 text-right font-mono font-semibold text-slate-900">
                    {tx.debit > 0 ? `₹${tx.debit.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="p-3 border border-slate-200 text-right font-mono font-semibold text-emerald-700">
                    {tx.credit > 0 ? `₹${tx.credit.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="p-3 border border-slate-200 text-right font-mono font-bold text-indigo-950">
                    ₹{Math.abs(tx.runningBalance).toLocaleString('en-IN')}{' '}
                    {tx.runningBalance >= 0 ? 'Dr' : 'Cr'}
                  </td>
                </tr>
              ))}

              {ledger.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-medium italic">
                    No transactions recorded for this client in the selected statement period.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold text-xs">
                <td colSpan={4} className="p-3 border border-slate-800 text-right uppercase">
                  Statement Closing Totals & Net Receivable:
                </td>
                <td className="p-3 border border-slate-800 text-right font-mono text-white">
                  ₹{totalBilled.toLocaleString('en-IN')}
                </td>
                <td className="p-3 border border-slate-800 text-right font-mono text-emerald-300">
                  ₹{totalReceived.toLocaleString('en-IN')}
                </td>
                <td className="p-3 border border-slate-800 text-right font-mono text-indigo-300 text-sm">
                  ₹{Math.abs(netOutstanding).toLocaleString('en-IN')} {netOutstanding >= 0 ? 'Dr' : 'Cr'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment Remittance Details & CA Sign-off Footer */}
        <div className="mt-8 pt-6 border-t-2 border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2">
              Remittance Bank Details for NEFT / RTGS
            </h4>
            <p>
              Account Holder: <span className="font-bold text-slate-900">{FIRM_DETAILS.name}</span>
            </p>
            <p>
              Bank Name: <span className="font-semibold text-slate-800">{FIRM_DETAILS.bankName}</span>
            </p>
            <p>
              Account Number:{' '}
              <span className="font-mono font-bold text-slate-900">{FIRM_DETAILS.accountNo}</span>
            </p>
            <p>
              IFSC Code: <span className="font-mono font-bold text-slate-900">{FIRM_DETAILS.ifsc}</span>
            </p>
            <p>
              UPI VPA ID: <span className="font-mono text-indigo-900 font-bold">{FIRM_DETAILS.upiId}</span>
            </p>
          </div>

          <div className="flex flex-col justify-between items-end text-right space-y-4">
            <div>
              <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                For {FIRM_DETAILS.name}
              </p>
              <p className="text-slate-500 font-mono text-[10px]">{FIRM_DETAILS.frn}</p>
            </div>

            <div className="pt-8 border-t border-slate-300 w-48 text-center">
              <p className="font-bold text-slate-900">CA Rajesh Kapoor</p>
              <p className="text-[10px] text-slate-600">Senior Managing Partner</p>
              <p className="text-[10px] font-mono text-slate-500">FCA 089412</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center font-mono">
          This is a system-generated Statement of Accounts issued by {FIRM_DETAILS.name}.
        </div>
      </div>
    </div>
  );
};
