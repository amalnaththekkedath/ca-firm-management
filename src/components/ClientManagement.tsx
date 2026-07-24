import React, { useState } from 'react';
import {
  Users2,
  Plus,
  Search,
  Building,
  FileText,
  Phone,
  Mail,
  MapPin,
  X,
  Edit2,
  CheckCircle,
  Receipt,
  Briefcase,
  ExternalLink,
  Download,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Trash2,
  Shield,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Client, EntityType } from '../types';

export const ClientManagement: React.FC = () => {
  const { clients, addClient, importClientsBatch, updateClient, deleteClient, tasks, invoices, users, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);

  // Delete Client Confirmation State
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // New Client Form State
  const [name, setName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [entityType, setEntityType] = useState<EntityType>('PVT_LTD');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [tan, setTan] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Maharashtra (27)');
  const [billingAddress, setBillingAddress] = useState('');
  const [retainerFee, setRetainerFee] = useState<number>(25000);
  const [sacCode, setSacCode] = useState('998231');
  const [partnerInChargeId, setPartnerInChargeId] = useState<string>('usr-1');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [openingBalanceType, setOpeningBalanceType] = useState<'DR' | 'CR'>('DR');
  const [openingBalanceDate, setOpeningBalanceDate] = useState<string>('2025-04-01');

  // Edit Client Modal State
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // CSV Import State
  const [rawCsvText, setRawCsvText] = useState('');
  const [parsedImportRows, setParsedImportRows] = useState<Array<Omit<Client, 'id' | 'code'>>>([]);
  const [importError, setImportError] = useState<string | null>(null);

  // Auto extract PAN from GSTIN (chars 3 to 12)
  const handleGstinChange = (val: string) => {
    const uppercaseVal = val.toUpperCase();
    setGstin(uppercaseVal);
    if (uppercaseVal.length >= 12) {
      setPan(uppercaseVal.substring(2, 12));
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedPartner = users.find((u) => u.id === partnerInChargeId);

    addClient({
      name,
      tradeName,
      entityType,
      gstin,
      pan,
      tan,
      contactPerson,
      email,
      phone,
      state,
      billingAddress,
      retainerFee: Number(retainerFee),
      status: 'ACTIVE',
      sacCode,
      financialYear: '2025-2026',
      partnerInChargeId,
      partnerInChargeName: selectedPartner?.name || 'CA Rajesh Kapoor',
      openingBalance: Number(openingBalance) || 0,
      openingBalanceType,
      openingBalanceDate: openingBalanceDate || '2025-04-01',
    });

    setIsAddModalOpen(false);
    // Reset Form
    setName('');
    setTradeName('');
    setGstin('');
    setPan('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setBillingAddress('');
    setOpeningBalance(0);
    setOpeningBalanceType('DR');
    setOpeningBalanceDate('2025-04-01');
  };

  const handleOpenEditModal = (client: Client) => {
    setEditingClient({ ...client });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    updateClient(editingClient);
    setIsEditModalOpen(false);
    if (selectedClientDetail && selectedClientDetail.id === editingClient.id) {
      setSelectedClientDetail(editingClient);
    }
    setEditingClient(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingClient) return;
    deleteClient(deletingClient.id);
    if (selectedClientDetail && selectedClientDetail.id === deletingClient.id) {
      setSelectedClientDetail(null);
    }
    if (editingClient && editingClient.id === deletingClient.id) {
      setIsEditModalOpen(false);
      setEditingClient(null);
    }
    setDeletingClient(null);
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    const headers = [
      'Code',
      'Company Name',
      'Trade Name',
      'Entity Type',
      'GSTIN',
      'PAN',
      'TAN',
      'Contact Person',
      'Email',
      'Phone',
      'State',
      'Billing Address',
      'Retainer Fee (INR)',
      'Opening Balance (INR)',
      'Balance Type (DR/CR)',
      'Opening Date',
      'Partner in Charge',
      'Financial Year',
      'Status',
    ];

    const rows = filteredClients.map((c) => [
      `"${c.code}"`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${(c.tradeName || '').replace(/"/g, '""')}"`,
      `"${c.entityType}"`,
      `"${c.gstin}"`,
      `"${c.pan}"`,
      `"${c.tan || ''}"`,
      `"${c.contactPerson.replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.state}"`,
      `"${c.billingAddress.replace(/"/g, '""')}"`,
      c.retainerFee,
      c.openingBalance || 0,
      `"${c.openingBalanceType || 'DR'}"`,
      `"${c.openingBalanceDate || '2025-04-01'}"`,
      `"${c.partnerInChargeName || 'CA Rajesh Kapoor'}"`,
      `"${c.financialYear}"`,
      `"${c.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Client_Master_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Sample CSV Template
  const handleDownloadSampleCsv = () => {
    const sampleHeaders = 'Company Name,Trade Name,Entity Type,GSTIN,PAN,TAN,Contact Person,Email,Phone,State,Billing Address,Retainer Fee,Partner in Charge,Opening Balance,Opening Balance Type,Opening Balance Date';
    const sampleRow1 = 'Acme Global Pvt Ltd,Acme Global,PVT_LTD,27AAACA9999B1Z5,AAACA9999B,MUMB99999C,Sanjay Kumar (Director),sanjay@acmeglobal.com,+91 98200 99999,Maharashtra (27),"Plot 45, MIDC Industrial Area, Pune",35000,CA Rajesh Kapoor,25000,DR,2025-04-01';
    const sampleRow2 = 'Bharat Logistics LLP,Bharat Express,LLP,27AABFB8888C1Z2,AABFB8888C,MUMB88888D,Pravin Patel,tax@bharatlogistics.in,+91 98111 88888,Maharashtra (27),"Level 2, Transport Nagar, Thane",25000,CA Rajesh Kapoor,12500,DR,2025-04-01';

    const csvContent = 'data:text/csv;charset=utf-8,' + [sampleHeaders, sampleRow1, sampleRow2].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Sample_Client_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process CSV Text
  const parseCsvText = (text: string) => {
    try {
      setImportError(null);
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setImportError('CSV file must contain a header row and at least one data row.');
        setParsedImportRows([]);
        return;
      }

      const parsed: Array<Omit<Client, 'id' | 'code'>> = [];

      // Simple CSV line parser
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map((c) => c.replace(/^"|"$/g, '').trim());

        if (cols.length >= 3 && cols[0]) {
          const compName = cols[0];
          const tName = cols[1] || '';
          const rawEntityType = (cols[2] || 'PVT_LTD').toUpperCase().replace(' ', '_');
          const validEntity: EntityType = ['PVT_LTD', 'LLP', 'PARTNERSHIP', 'PROPRIETORSHIP', 'INDIVIDUAL'].includes(rawEntityType)
            ? (rawEntityType as EntityType)
            : 'PVT_LTD';

          const gstinVal = cols[3] || '27AAAC00000A1Z0';
          const panVal = cols[4] || (gstinVal.length >= 12 ? gstinVal.substring(2, 12) : 'AAAC00000A');
          const tanVal = cols[5] || '';
          const contactVal = cols[6] || 'Accounts Manager';
          const emailVal = cols[7] || 'accounts@client.in';
          const phoneVal = cols[8] || '+91 98000 00000';
          const stateVal = cols[9] || 'Maharashtra (27)';
          const addressVal = cols[10] || 'Registered Corporate Office Address';
          const feeVal = Number(cols[11]) || 20000;
          const partnerName = cols[12] || 'CA Rajesh Kapoor';
          const opBalVal = Number(cols[13]) || 0;
          const opBalTypeVal = (cols[14] || 'DR').toUpperCase() === 'CR' ? 'CR' : 'DR';
          const opBalDateVal = cols[15] || '2025-04-01';

          parsed.push({
            name: compName,
            tradeName: tName,
            entityType: validEntity,
            gstin: gstinVal,
            pan: panVal,
            tan: tanVal,
            contactPerson: contactVal,
            email: emailVal,
            phone: phoneVal,
            state: stateVal,
            billingAddress: addressVal,
            retainerFee: feeVal,
            status: 'ACTIVE',
            sacCode: '998231',
            financialYear: '2025-2026',
            partnerInChargeName: partnerName,
            openingBalance: opBalVal,
            openingBalanceType: opBalTypeVal,
            openingBalanceDate: opBalDateVal,
          });
        }
      }

      setParsedImportRows(parsed);
    } catch (e) {
      setImportError('Failed to parse CSV format. Please ensure valid comma-separated values.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setRawCsvText(content);
        parseCsvText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmBatchImport = () => {
    if (parsedImportRows.length === 0) return;
    importClientsBatch(parsedImportRows);
    setIsImportModalOpen(false);
    setRawCsvText('');
    setParsedImportRows([]);
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEntity =
      selectedEntityType === 'ALL' || c.entityType === selectedEntityType;

    return matchesSearch && matchesEntity;
  });

  return (
    <div className="p-6 space-y-6 text-slate-900 max-w-7xl mx-auto">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users2 className="w-5 h-5 text-indigo-600" /> Client Master Directory
          </h1>
          <p className="text-xs text-slate-500">
            Corporate entity register, PAN & GSTIN mapping, Partner assignment, CSV import & export
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-indigo-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200"
          >
            <Upload className="w-4 h-4" /> Import CSV
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-emerald-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-4 h-4" /> Export CSV ({filteredClients.length})
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add New Client
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Client Name, Code, GSTIN, or PAN..."
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Entity Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'PVT_LTD', 'LLP', 'PARTNERSHIP', 'PROPRIETORSHIP'].map((eType) => (
            <button
              key={eType}
              onClick={() => setSelectedEntityType(eType)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition shrink-0 ${
                selectedEntityType === eType
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {eType.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientTasks = tasks.filter((t) => t.clientId === client.id);
          const clientInvoices = invoices.filter((i) => i.clientId === client.id);

          return (
            <div
              key={client.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-indigo-400 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-mono">
                      {client.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1.5 line-clamp-1">
                      {client.name}
                    </h3>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-2 py-0.5 rounded uppercase">
                    {client.entityType.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">GSTIN:</span>
                    <span className="font-mono text-slate-900 font-bold">{client.gstin}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">PAN:</span>
                    <span className="font-mono text-slate-700">{client.pan}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Opening Balance:</span>
                    <span className="font-mono text-amber-700 font-bold">
                      {client.openingBalance
                        ? `₹${client.openingBalance.toLocaleString('en-IN')} ${client.openingBalanceType || 'DR'}`
                        : '₹0 (Nil)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Partner-in-Charge:</span>
                    <span className="font-semibold text-indigo-700">
                      {client.partnerInChargeName || 'CA Rajesh Kapoor'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Retainer Fee:</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      ₹{client.retainerFee.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Contact:</span>
                    <span className="text-slate-800 font-medium truncate max-w-[160px]">{client.contactPerson}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {clientTasks.length} Active Jobs • {clientInvoices.length} Bills
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(client)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg font-medium transition flex items-center gap-1"
                    title="Edit Client & Opening Balance"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>

                  <button
                    onClick={() => setDeletingClient(client)}
                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-lg font-medium transition flex items-center gap-1"
                    title="Delete Client Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>

                  <button
                    onClick={() => setSelectedClientDetail(client)}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-lg font-semibold transition flex items-center gap-1"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full text-slate-900 shadow-2xl overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" /> Batch Import Clients via CSV
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload or paste a CSV file containing company names, GSTIN, PAN, and retainer amounts
                </p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Upload CSV File
                </label>
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 underline"
                >
                  <Download className="w-3.5 h-3.5" /> Download Sample CSV Template
                </button>
              </div>

              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="block w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 border border-slate-200 rounded-2xl p-2 bg-slate-50"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Or Paste Raw CSV Text
                </label>
                <textarea
                  value={rawCsvText}
                  onChange={(e) => {
                    setRawCsvText(e.target.value);
                    parseCsvText(e.target.value);
                  }}
                  placeholder="Paste CSV rows here (Company Name, Trade Name, Entity Type, GSTIN, PAN...)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-500 h-28"
                />
              </div>

              {importError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Preview parsed rows */}
              {parsedImportRows.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Ready to Import {parsedImportRows.length} Client Records
                    </span>
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {parsedImportRows.map((r, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{r.name}</p>
                          <p className="text-[11px] text-slate-500">
                            GSTIN: {r.gstin} • Retainer: ₹{r.retainerFee.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
                          {r.entityType}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parsedImportRows.length === 0}
                onClick={handleConfirmBatchImport}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
              >
                Confirm Batch Import ({parsedImportRows.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full text-slate-900 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" /> Add Client Entity
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Entity Legal Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Industries India Pvt Ltd"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Entity Constitution Type
                  </label>
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value as EntityType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PVT_LTD">Private Limited Company</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="PARTNERSHIP">Partnership Firm</option>
                    <option value="PROPRIETORSHIP">Proprietorship Firm</option>
                    <option value="INDIVIDUAL">Individual Assessee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => handleGstinChange(e.target.value)}
                    placeholder="27AAACA1234B1Z5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-mono uppercase focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PAN Number (Auto-extracted)
                  </label>
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value.toUpperCase())}
                    placeholder="AAACA1234B"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-mono uppercase focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Partner-in-Charge
                  </label>
                  <select
                    value={partnerInChargeId}
                    onChange={(e) => setPartnerInChargeId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    {users
                      .filter((u) => u.role === 'PARTNER' || u.role === 'ADMINISTRATOR' || u.role === 'AUDIT_MANAGER')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.designation})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Key Contact Person
                  </label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Vikram Malhotra (CFO)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="finance@acme.in"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98200 11223"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered GST Billing Address
                </label>
                <textarea
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Full office location address for tax invoice..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 h-16"
                  required
                />
              </div>

              {/* Opening Balance Setup */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
                <h3 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" /> Opening Balance Ledger Setup
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Opening Balance (₹)
                    </label>
                    <input
                      type="number"
                      value={openingBalance || ''}
                      onChange={(e) => setOpeningBalance(Number(e.target.value))}
                      placeholder="e.g. 25000"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Balance Type
                    </label>
                    <select
                      value={openingBalanceType}
                      onChange={(e) => setOpeningBalanceType(e.target.value as 'DR' | 'CR')}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                    >
                      <option value="DR">Debit (DR) - Outstanding / Receivable</option>
                      <option value="CR">Credit (CR) - Advance Received</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      As On Date
                    </label>
                    <input
                      type="date"
                      value={openingBalanceDate}
                      onChange={(e) => setOpeningBalanceDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs"
                >
                  Create Client Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditModalOpen && editingClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full text-slate-900 shadow-2xl overflow-hidden space-y-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-indigo-600" />
                Edit Client: {editingClient.code} ({editingClient.name})
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Company / Entity Name</label>
                  <input
                    type="text"
                    value={editingClient.name}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trade Name (Optional)</label>
                  <input
                    type="text"
                    value={editingClient.tradeName || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, tradeName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Entity Structure</label>
                  <select
                    value={editingClient.entityType}
                    onChange={(e) => setEditingClient({ ...editingClient, entityType: e.target.value as EntityType })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="PVT_LTD">Private Limited (Pvt Ltd)</option>
                    <option value="LLP">Limited Liability Partnership (LLP)</option>
                    <option value="PARTNERSHIP">Partnership Firm</option>
                    <option value="PROPRIETORSHIP">Sole Proprietorship</option>
                    <option value="INDIVIDUAL">Individual Assessee</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={editingClient.gstin}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setEditingClient({
                        ...editingClient,
                        gstin: val,
                        pan: val.length >= 12 ? val.substring(2, 12) : editingClient.pan,
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={editingClient.pan}
                    onChange={(e) => setEditingClient({ ...editingClient, pan: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Retainer Fee (Monthly ₹)</label>
                  <input
                    type="number"
                    value={editingClient.retainerFee}
                    onChange={(e) => setEditingClient({ ...editingClient, retainerFee: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Partner-in-Charge</label>
                  <select
                    value={editingClient.partnerInChargeId || 'usr-1'}
                    onChange={(e) => {
                      const p = users.find((u) => u.id === e.target.value);
                      setEditingClient({
                        ...editingClient,
                        partnerInChargeId: e.target.value,
                        partnerInChargeName: p?.name || 'CA Rajesh Kapoor',
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={editingClient.contactPerson}
                    onChange={(e) => setEditingClient({ ...editingClient, contactPerson: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Opening Balance Section in Edit */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
                <h3 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5" /> Opening Balance Ledger
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Opening Balance (₹)
                    </label>
                    <input
                      type="number"
                      value={editingClient.openingBalance ?? 0}
                      onChange={(e) => setEditingClient({ ...editingClient, openingBalance: Number(e.target.value) })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Balance Type
                    </label>
                    <select
                      value={editingClient.openingBalanceType || 'DR'}
                      onChange={(e) =>
                        setEditingClient({ ...editingClient, openingBalanceType: e.target.value as 'DR' | 'CR' })
                      }
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                    >
                      <option value="DR">Debit (DR) - Outstanding / Receivable</option>
                      <option value="CR">Credit (CR) - Advance Received</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      As On Date
                    </label>
                    <input
                      type="date"
                      value={editingClient.openingBalanceDate || '2025-04-01'}
                      onChange={(e) => setEditingClient({ ...editingClient, openingBalanceDate: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Registered Billing Address</label>
                <textarea
                  value={editingClient.billingAddress}
                  onChange={(e) => setEditingClient({ ...editingClient, billingAddress: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-indigo-500 h-16"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const c = editingClient;
                    setIsEditModalOpen(false);
                    setEditingClient(null);
                    setDeletingClient(c);
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Client
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Detail Drawer / Overlay */}
      {selectedClientDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full text-slate-900 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded font-mono font-bold">
                    {selectedClientDetail.code}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                    {selectedClientDetail.name}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(selectedClientDetail)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-600" /> Edit Entity
                </button>
                <button
                  onClick={() => setDeletingClient(selectedClientDetail)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Entity
                </button>
                <button
                  onClick={() => setSelectedClientDetail(null)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">GSTIN:</span>
                  <span className="font-mono text-slate-900 font-bold">{selectedClientDetail.gstin}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">PAN:</span>
                  <span className="font-mono text-slate-700">{selectedClientDetail.pan}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Opening Balance:</span>
                  <span className="font-mono text-amber-700 font-bold">
                    {selectedClientDetail.openingBalance
                      ? `₹${selectedClientDetail.openingBalance.toLocaleString('en-IN')} ${selectedClientDetail.openingBalanceType || 'DR'}`
                      : '₹0 (Nil)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Partner-in-Charge:</span>
                  <span className="font-semibold text-indigo-700">
                    {selectedClientDetail.partnerInChargeName || 'CA Rajesh Kapoor'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Retainer Fee:</span>
                  <span className="font-mono text-emerald-700 font-bold">
                    ₹{selectedClientDetail.retainerFee.toLocaleString('en-IN')}/mo
                  </span>
                </div>
              </div>

              {/* Active Tasks Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Active Compliance Filings ({tasks.filter((t) => t.clientId === selectedClientDetail.id).length})
                </h4>
                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.clientId === selectedClientDetail.id)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{t.title}</p>
                          <p className="text-slate-500 mt-0.5">
                            Assigned to: {t.assignedToName} • Due: {t.dueDate}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded">
                          {t.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Invoices Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Invoices Ledger ({invoices.filter((i) => i.clientId === selectedClientDetail.id).length})
                </h4>
                <div className="space-y-2">
                  {invoices
                    .filter((i) => i.clientId === selectedClientDetail.id)
                    .map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{inv.invoiceNumber}</p>
                          <p className="text-slate-500 mt-0.5">
                            Date: {inv.invoiceDate} • Amount: ₹{inv.totalAmount.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedClientDetail(null)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Client Confirmation Modal */}
      {deletingClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full text-slate-900 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Client Master Record?</h3>
                <p className="text-xs text-slate-500">Irreversible Directory Operation</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-500">Client Code:</span>
                <span className="font-mono font-bold text-slate-900">{deletingClient.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Entity Name:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{deletingClient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GSTIN:</span>
                <span className="font-mono text-slate-800">{deletingClient.gstin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PAN:</span>
                <span className="font-mono text-slate-800">{deletingClient.pan}</span>
              </div>
            </div>

            {/* Check linked items */}
            {(() => {
              const linkedTasks = tasks.filter((t) => t.clientId === deletingClient.id);
              const linkedInvoices = invoices.filter((i) => i.clientId === deletingClient.id);
              const hasLinkedData = linkedTasks.length > 0 || linkedInvoices.length > 0;

              return (
                hasLinkedData && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                      Associated Client Data Alert
                    </span>
                    <p className="text-[11px] text-amber-800">
                      This client has <strong className="font-semibold">{linkedTasks.length} active jobs</strong> and{' '}
                      <strong className="font-semibold">{linkedInvoices.length} billing records</strong> registered. Deleting this client will unbind them from the active directory.
                    </p>
                  </div>
                )
              );
            })()}

            <p className="text-xs text-slate-600">
              Are you sure you want to delete <strong className="text-slate-900">{deletingClient.name}</strong> from the client master directory?
            </p>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingClient(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Yes, Delete Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
