import React, { useState } from 'react';
import { Sprout, Building2, ShoppingBag, Truck, ShieldCheck, Factory, ArrowRight, Lock, KeyRound, Check, AlertCircle } from 'lucide-react';
import { Role } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface MainLandingProps {
  onSelectRole: (role: Role) => void;
}

export const MainLanding: React.FC<MainLandingProps> = ({ onSelectRole }) => {
  const { currentUser, demoLogin, login, register, isLoading, error, clearError } = useAuth();
  const { t } = useLanguage();

  const [activeModalRole, setActiveModalRole] = useState<Role | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login form fields
  const [email, setEmail] = useState('');
  const [adminPassKey, setAdminPassKey] = useState('');
  
  // Registration form fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regLocation, setRegLocation] = useState('Ongole, Andhra Pradesh');
  const [vehicleType, setVehicleType] = useState<'Bike' | 'Auto' | 'Mini Truck' | 'Pickup Truck' | 'Truck' | 'Refrigerated Vehicle'>('Mini Truck');
  const [vehicleNumber, setVehicleNumber] = useState('AP 27 XY 2026');
  const [fpoName, setFpoName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const rolesList: {
    id: Role;
    titleKey: string;
    englishTitle: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    badge: string;
    demoUser: string;
    desc: string;
  }[] = [
    {
      id: 'farmer',
      titleKey: 'roleFarmer',
      englishTitle: 'Farmer',
      subtitle: 'List crops, monitor mandis, get AI recommendations & direct payouts',
      icon: <Sprout className="w-8 h-8 text-emerald-600" />,
      color: 'border-emerald-200 hover:border-emerald-500 bg-emerald-50/20 hover:bg-emerald-50/50',
      badge: 'Direct Producer',
      demoUser: 'Ramesh Reddy (Ongole)',
      desc: 'Add produce listings, view market prices, demand forecasts & earnings.'
    },
    {
      id: 'fpo',
      titleKey: 'roleFpo',
      englishTitle: 'FPO',
      subtitle: 'Aggregate member farmer produce into high-volume bulk lots',
      icon: <Building2 className="w-8 h-8 text-teal-600" />,
      color: 'border-teal-200 hover:border-teal-500 bg-teal-50/20 hover:bg-teal-50/50',
      badge: 'Aggregation Hub',
      demoUser: 'Prakasam Rythu Mitra FPO',
      desc: 'Aggregate member produce (e.g. 5,000 kg Tomato) & match bulk buyers.'
    },
    {
      id: 'customer',
      titleKey: 'roleCustomer',
      englishTitle: 'Small-Scale Customer',
      subtitle: 'Buy fresh farm produce (1–5 kg) directly from nearby farmers',
      icon: <ShoppingBag className="w-8 h-8 text-sky-600" />,
      color: 'border-sky-200 hover:border-sky-500 bg-sky-50/20 hover:bg-sky-50/50',
      badge: '1–5 kg Household',
      demoUser: 'Priya Sharma (Ongole Central)',
      desc: 'Browse nearby farmers within 3/5/10 km radius, low logistics fee.'
    },
    {
      id: 'bulkBuyer',
      titleKey: 'roleBulkBuyer',
      englishTitle: 'Bulk Buyer',
      subtitle: 'Industrial procurers, food processors, exporters & institutions',
      icon: <Factory className="w-8 h-8 text-amber-600" />,
      color: 'border-amber-200 hover:border-amber-500 bg-amber-50/20 hover:bg-amber-50/50',
      badge: 'Institutional',
      demoUser: 'Ananya Foods & Agro Processing',
      desc: 'Post bulk requirements (e.g. 5,000 kg) and view algorithmic match scores.'
    },
    {
      id: 'logisticsProvider',
      titleKey: 'roleLogistics',
      englishTitle: 'Logistics Provider',
      subtitle: 'Fleet drivers, mini-truck owners & delivery partners',
      icon: <Truck className="w-8 h-8 text-indigo-600" />,
      color: 'border-indigo-200 hover:border-indigo-500 bg-indigo-50/20 hover:bg-indigo-50/50',
      badge: 'Route Engine',
      demoUser: 'Suresh Express Logistics (Mini Truck)',
      desc: 'Accept deliveries, update transit stages, optimize routes & track earnings.'
    },
    {
      id: 'admin',
      titleKey: 'roleAdmin',
      englishTitle: 'Admin',
      subtitle: 'Central regulatory oversight, analytics, payments & platform audit',
      icon: <ShieldCheck className="w-8 h-8 text-rose-600" />,
      color: 'border-rose-200 hover:border-rose-500 bg-rose-50/20 hover:bg-rose-50/50',
      badge: 'Key Required',
      demoUser: 'Central Controller (Pass Key)',
      desc: 'Monitor all 6 participant groups, live orders, fees & system stats.'
    }
  ];

  const handleRoleCardClick = (role: Role) => {
    // If the user is already authenticated for this role, directly go to the dashboard without asking to sign in again!
    if (currentUser && currentUser.role === role) {
      onSelectRole(role);
      return;
    }
    setActiveModalRole(role);
    setAuthMode('login');
    setLocalError(null);
    clearError();
    setEmail('');
    setAdminPassKey('');
  };

  const handleQuickDemoAccess = async (role: Role) => {
    setLocalError(null);
    clearError();
    if (role === 'admin') {
      // Prompt for admin pass key or open modal
      setActiveModalRole('admin');
      return;
    }
    try {
      await demoLogin(role);
      onSelectRole(role);
    } catch (err: any) {
      setLocalError(err.message || 'Demo login failed');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalRole) return;
    setLocalError(null);
    clearError();

    if (activeModalRole === 'admin' && !adminPassKey) {
      setLocalError('Please enter the Admin Authentication Key.');
      return;
    }

    try {
      await login(email, activeModalRole, adminPassKey);
      onSelectRole(activeModalRole);
      setActiveModalRole(null);
    } catch (err: any) {
      setLocalError(err.message || 'Authentication error');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalRole) return;
    setLocalError(null);
    clearError();

    if (!regName || !regEmail || !regPhone) {
      setLocalError('Please provide Name, Email and Phone.');
      return;
    }

    try {
      await register({
        name: regName,
        email: regEmail,
        phone: regPhone,
        address: regAddress,
        location: regLocation,
        role: activeModalRole,
        vehicleType: activeModalRole === 'logisticsProvider' ? vehicleType : undefined,
        vehicleNumber: activeModalRole === 'logisticsProvider' ? vehicleNumber : undefined,
        fpoName: activeModalRole === 'fpo' ? fpoName : undefined
      });
      onSelectRole(activeModalRole);
      setActiveModalRole(null);
    } catch (err: any) {
      setLocalError(err.message || 'Registration error');
    }
  };

  return (
    <div className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Hero Branding Section */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center space-x-2 bg-emerald-100/80 text-emerald-900 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 tracking-wide">
          <Sprout className="w-4 h-4 text-emerald-700" />
          <span>Agricultural Marketplace & Optimization Network</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          Kisaan2Karidhar
        </h1>
        
        <p className="mt-3 text-base sm:text-lg text-slate-600 font-medium">
          {t('tagline')}
        </p>

        <div className="mt-6 pt-5 border-t border-slate-200">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            {t('chooseInterface')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Select your role to access customized dashboards, real-time orders, and workflows
          </p>

          {/* Active Session Notification (Directly go to dashboard without re-signing in) */}
          {currentUser && (
            <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-left shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-600">Active session: </span>
                  <strong className="text-emerald-900 font-bold">{currentUser.name}</strong>{' '}
                  <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                    {currentUser.role}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    You do not need to sign in again. Click your workspace or select another role.
                  </p>
                </div>
              </div>

              <button
                id="btn-resume-active-role"
                onClick={() => onSelectRole(currentUser.role)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0"
              >
                Directly Open My Workspace &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Six Roles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rolesList.map((item) => (
          <div
            key={item.id}
            id={`role-card-${item.id}`}
            className={`relative rounded-2xl border-2 p-6 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md ${item.color}`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
                  {item.icon}
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-700">
                  {item.badge}
                </span>
              </div>

              <h3 className="text-xl font-extrabold text-slate-900">
                {t(item.titleKey)}
              </h3>
              
              <p className="text-xs font-semibold text-emerald-800 mt-1">
                {item.subtitle}
              </p>
              
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {item.desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200/60 flex flex-col space-y-2">
              <button
                id={`btn-open-${item.id}`}
                onClick={() => handleRoleCardClick(item.id)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
              >
                <span>Enter {item.englishTitle}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                id={`btn-demo-${item.id}`}
                onClick={() => handleQuickDemoAccess(item.id)}
                className="w-full py-2 px-3 rounded-lg bg-white/80 hover:bg-white text-slate-700 border border-slate-300 text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors"
                title={`One-click demo login as ${item.demoUser}`}
              >
                <span>Demo Access: {item.demoUser}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Role Login / Registration Modal */}
      {activeModalRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base text-slate-900">
                  {t(rolesList.find(r => r.id === activeModalRole)?.titleKey || '')} Portal
                </span>
              </div>
              <button
                onClick={() => setActiveModalRole(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Error banner */}
            {(localError || error) && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{localError || error}</span>
              </div>
            )}

            {/* Switch tabs (not for admin) */}
            {activeModalRole !== 'admin' && (
              <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    authMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {activeModalRole === 'admin' ? (
              /* Admin Authentication Flow */
              <form onSubmit={handleLoginSubmit} className="mt-4 space-y-4">
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-medium">
                  🔒 Restricted: Admin access requires administrative pass key authentication.
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admin Email / Username
                  </label>
                  <input
                    id="input-admin-email"
                    type="email"
                    required
                    value={email || 'admin@kisaan2karidhar.gov.in'}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Admin Pass Key
                  </label>
                  <div className="relative">
                    <input
                      id="input-admin-passkey"
                      type="password"
                      required
                      placeholder="Enter passkey (mahendra@123)"
                      value={adminPassKey}
                      onChange={(e) => setAdminPassKey(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Master key: <code className="bg-slate-100 text-rose-700 px-1 py-0.5 rounded font-mono font-bold">mahendra@123</code> for full administrative access.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-admin-verify"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    {isLoading ? 'Verifying Key...' : 'Authenticate & Open Dashboard'}
                  </button>
                </div>
              </form>
            ) : authMode === 'login' ? (
              /* Standard Sign In */
              <form onSubmit={handleLoginSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    id="input-login-email"
                    type="email"
                    required
                    placeholder="you@kisaan.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input
                    id="input-login-password"
                    type="password"
                    placeholder="••••••••"
                    defaultValue="demo1234"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    id="btn-submit-login"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoAccess(activeModalRole)}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    Use Verified Demo Profile
                  </button>
                </div>
              </form>
            ) : (
              /* Registration Flow */
              <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name / Organization Name</label>
                  <input
                    id="input-reg-name"
                    type="text"
                    required
                    placeholder="e.g. Ramesh Reddy"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email</label>
                    <input
                      id="input-reg-email"
                      type="email"
                      required
                      placeholder="name@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      id="input-reg-phone"
                      type="tel"
                      required
                      placeholder="+91 98480..."
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {activeModalRole === 'fpo' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">FPO Registered Entity Name</label>
                    <input
                      type="text"
                      placeholder="Prakasam Rythu Producer Co."
                      value={fpoName}
                      onChange={(e) => setFpoName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                )}

                {activeModalRole === 'logisticsProvider' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Type of Vehicle</label>
                      <select
                        id="select-vehicle-type"
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Bike">Bike</option>
                        <option value="Auto">Auto</option>
                        <option value="Mini Truck">Mini Truck</option>
                        <option value="Pickup Truck">Pickup Truck</option>
                        <option value="Truck">Truck</option>
                        <option value="Refrigerated Vehicle">Refrigerated Vehicle</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Vehicle Number</label>
                      <input
                        id="input-vehicle-number"
                        type="text"
                        placeholder="AP 27 XY 1024"
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Address / Service Area</label>
                  <input
                    type="text"
                    placeholder="Plot 14, Trunk Road"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="pt-2">
                  <button
                    id="btn-submit-register"
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors"
                  >
                    {isLoading ? 'Creating Account...' : 'Register & Continue'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
