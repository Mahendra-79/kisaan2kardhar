import React, { useState } from 'react';
import { ArrowLeft, Home, Globe, LogOut, Sprout, Shield, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { NotificationBell } from './NotificationBell';
import { UserProfileModal } from './UserProfileModal';
import { Language } from '../../types';

interface HeaderProps {
  onBack?: () => void;
  onMain: () => void;
  canGoBack?: boolean;
  currentScreenTitle?: string;
  currentView?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onBack,
  onMain,
  canGoBack = false,
  currentScreenTitle,
  currentView
}) => {
  const { currentUser, role, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isNotMain = currentView ? currentView !== 'main' : canGoBack;

  const getRoleBadge = () => {
    switch (role) {
      case 'farmer':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"><Sprout className="w-3.5 h-3.5" /> Farmer</span>;
      case 'fpo':
        return <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-1 rounded-full font-semibold">FPO</span>;
      case 'customer':
        return <span className="bg-sky-100 text-sky-800 text-xs px-2.5 py-1 rounded-full font-semibold">Customer (1-5 kg)</span>;
      case 'bulkBuyer':
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-semibold">Bulk Buyer</span>;
      case 'logisticsProvider':
        return <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full font-semibold">Logistics Fleet</span>;
      case 'admin':
        return <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Admin</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left section: Back button + Brand logo */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {(isNotMain || canGoBack) && onBack && (
              <button
                id="btn-nav-back"
                onClick={onBack}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300 shadow-xs focus:outline-hidden"
                title="Go back to previous screen or role selection"
              >
                <ArrowLeft className="w-4 h-4 text-slate-700" />
                <span>{t('back')}</span>
              </button>
            )}

            <button
              id="btn-nav-main"
              onClick={onMain}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 shadow-xs focus:outline-hidden"
              title="Return to central role-selection page"
            >
              <Home className="w-4 h-4 text-emerald-700" />
              <span className="font-semibold">{t('main')}</span>
            </button>

            <div
              onClick={onMain}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-emerald-950 leading-tight">
                  Kisaan2Karidhar
                </span>
                <span className="text-[10px] text-emerald-700 font-medium hidden md:inline">
                  Farm-to-Buyer Direct Engine
                </span>
              </div>
            </div>

            {currentScreenTitle && (
              <div className="hidden lg:flex items-center pl-3 border-l border-slate-200 text-xs font-medium text-slate-500">
                {currentScreenTitle}
              </div>
            )}
          </div>

          {/* Right section: Language selector + Notifications + User badge + Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Language dropdown */}
            <div className="relative inline-flex items-center bg-slate-50 rounded-lg border border-slate-200 px-2 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
              <select
                id="select-app-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                aria-label="Select interface language"
                className="bg-transparent text-slate-800 font-medium text-xs focus:outline-none cursor-pointer pr-1"
              >
                <option value="en">English</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            {/* Notifications */}
            {currentUser && <NotificationBell />}

            {/* Current user, role badge & Profile button */}
            {currentUser && (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="hidden md:block">
                  {getRoleBadge()}
                </div>
                
                <button
                  id="btn-nav-profile"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs hover:border-slate-300"
                  title="View and edit profile, address, and verification"
                >
                  <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="max-w-[110px] truncate">{currentUser?.name || 'Profile'}</span>
                </button>
              </div>
            )}

            {/* Logout button if logged in */}
            {currentUser && (
              <button
                id="btn-nav-logout"
                onClick={() => {
                  logout();
                  onMain();
                }}
                className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Global Profile Modal available in all user UIs */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={() => {
          logout();
          onMain();
        }}
      />
    </header>
  );
};
