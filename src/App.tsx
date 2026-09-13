import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Header } from './components/common/Header';
import { MainLanding } from './components/roles/MainLanding';
import { FarmerDashboard } from './components/roles/FarmerDashboard';
import { FpoDashboard } from './components/roles/FpoDashboard';
import { CustomerDashboard } from './components/roles/CustomerDashboard';
import { BulkBuyerDashboard } from './components/roles/BulkBuyerDashboard';
import { LogisticsDashboard } from './components/roles/LogisticsDashboard';
import { AdminDashboard } from './components/roles/AdminDashboard';
import { Role } from './types';
import { KeyRound, AlertCircle, X, ShieldCheck, Sprout } from 'lucide-react';

function AppContent() {
  const { currentUser, role, login, demoLogin, error, clearError } = useAuth();
  const { t } = useLanguage();

  const [currentView, setCurrentView] = useState<Role | 'main'>(() => {
    try {
      const stored = localStorage.getItem('k2k_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.role) {
          return u.role as Role;
        }
      }
    } catch (e) {
      console.warn('Failed to parse k2k_user', e);
    }
    return 'main';
  });

  const [viewHistory, setViewHistory] = useState<(Role | 'main')[]>(() => {
    try {
      const stored = localStorage.getItem('k2k_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.role) {
          return [u.role as Role];
        }
      }
    } catch (e) {}
    return ['main'];
  });
  
  // Admin pass key gate modal if directly opening admin
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [adminPassKeyInput, setAdminPassKeyInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);

  // If user is authenticated or changes role, automatically navigate to their role dashboard
  useEffect(() => {
    if (currentUser?.role) {
      setCurrentView(currentUser.role);
    }
  }, [currentUser?.role]);

  const navigateTo = (view: Role | 'main') => {
    if (view === 'admin') {
      if (currentUser?.role !== 'admin') {
        setIsAdminAuthModalOpen(true);
        setAdminAuthError(null);
        setAdminPassKeyInput('');
        return;
      }
    }
    setViewHistory(prev => [...prev, view]);
    setCurrentView(view);
  };

  const handleGoBack = () => {
    if (viewHistory.length > 1) {
      const newHist = [...viewHistory];
      newHist.pop();
      const prev = newHist[newHist.length - 1];
      setViewHistory(newHist);
      setCurrentView(prev);
    } else {
      setViewHistory(['main']);
      setCurrentView('main');
    }
  };

  const handleReturnToMain = () => {
    setViewHistory(['main']);
    setCurrentView('main');
  };

  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    clearError();
    try {
      await login('admin@kisaan2karidhar.gov.in', 'admin', adminPassKeyInput);
      setIsAdminAuthModalOpen(false);
      setViewHistory(prev => [...prev, 'admin']);
      setCurrentView('admin');
    } catch (err: any) {
      setAdminAuthError(err.message || 'Invalid admin authentication key');
    }
  };

  const getScreenTitle = () => {
    switch (currentView) {
      case 'farmer': return 'Farmer Portal';
      case 'fpo': return 'FPO Aggregation Portal';
      case 'customer': return 'Customer Marketplace (1–5 kg)';
      case 'bulkBuyer': return 'Bulk Buyer Matching Portal';
      case 'logisticsProvider': return 'Logistics & Route Optimization Fleet';
      case 'admin': return 'Administrative Governance Console';
      default: return 'Role Selection & Overview';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Top Header with Language, Role Badge, Main & Back navigation */}
      <Header
        onBack={handleGoBack}
        onMain={handleReturnToMain}
        canGoBack={currentView !== 'main'}
        currentView={currentView}
        currentScreenTitle={getScreenTitle()}
      />

      {/* Main Dynamic View */}
      <main className="flex-1">
        {currentView === 'main' && (
          <MainLanding
            onSelectRole={(roleSelected) => {
              setViewHistory(prev => [...prev, roleSelected]);
              setCurrentView(roleSelected);
            }}
          />
        )}

        {currentView === 'farmer' && <FarmerDashboard onBack={handleGoBack} />}
        {currentView === 'fpo' && <FpoDashboard onBack={handleGoBack} />}
        {currentView === 'customer' && <CustomerDashboard onBack={handleGoBack} />}
        {currentView === 'bulkBuyer' && <BulkBuyerDashboard onBack={handleGoBack} />}
        {currentView === 'logisticsProvider' && <LogisticsDashboard onBack={handleGoBack} />}
        {currentView === 'admin' && <AdminDashboard onBack={handleGoBack} />}
      </main>

      {/* Admin Pass Key Modal */}
      {isAdminAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAdminAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-center text-slate-900">Admin Authentication</h3>
            <p className="text-xs text-slate-500 text-center mt-1 mb-4">
              Enter the platform administrative key to access the regulatory monitoring console.
            </p>

            {(adminAuthError || error) && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{adminAuthError || error}</span>
              </div>
            )}

            <form onSubmit={handleAdminAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Admin Pass Key
                </label>
                <div className="relative">
                  <input
                    id="input-modal-admin-passkey"
                    type="password"
                    required
                    placeholder="Enter pass key"
                    value={adminPassKeyInput}
                    onChange={(e) => setAdminPassKeyInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-admin-modal-verify"
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Verify Key & Enter Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Sprout className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-800">Kisaan2Karidhar</span>
            <span>— Direct Agricultural Marketplace & Logistics Optimization</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
              Ongole & Andhra Pradesh Pilot
            </span>
            <span>English • Telugu • Hindi</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
