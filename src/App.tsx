import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { TaskBoard } from './components/TaskBoard';
import { ClientManagement } from './components/ClientManagement';
import { StatementOfAccounts } from './components/StatementOfAccounts';
import { AttendanceTracker } from './components/AttendanceTracker';
import { Timesheets } from './components/Timesheets';
import { BillingInvoicing } from './components/BillingInvoicing';
import { FinancialOversight } from './components/FinancialOversight';
import { EmployeeManagement } from './components/EmployeeManagement';
import { NoticeBoard } from './components/NoticeBoard';
import { InternalMessaging } from './components/InternalMessaging';
import { FirmSettings } from './components/FirmSettings';
import { AICaAdvisorModal } from './components/AICaAdvisorModal';
import { RoleSelectorModal } from './components/RoleSelectorModal';
import { QuickSearchModal } from './components/QuickSearchModal';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentUser, activeTab } = useApp();

  if (!isAuthenticated || !currentUser) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden select-none">
      {/* Fixed Left Desktop Navigation Sidebar */}
      <Sidebar />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Desktop Action Header Bar */}
        <Header />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto bg-slate-50/80">
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'notices' && <NoticeBoard />}
          {activeTab === 'messaging' && <InternalMessaging />}
          {activeTab === 'employees' && <EmployeeManagement />}
          {activeTab === 'tasks' && <TaskBoard />}
          {activeTab === 'clients' && <ClientManagement />}
          {activeTab === 'soa' && <StatementOfAccounts />}
          {activeTab === 'attendance' && <AttendanceTracker />}
          {activeTab === 'timesheets' && <Timesheets />}
          {activeTab === 'invoicing' && <BillingInvoicing />}
          {(activeTab === 'reports' || activeTab === 'financials') && <FinancialOversight />}
          {activeTab === 'firm_settings' && <FirmSettings />}
          {activeTab === 'ai_advisor' && <AICaAdvisorModal />}
        </main>
      </div>

      {/* Global Modals */}
      <RoleSelectorModal />
      <QuickSearchModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
