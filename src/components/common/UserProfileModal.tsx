import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Building,
  Truck,
  Sprout,
  Save,
  LogOut,
  Sparkles,
  KeyRound,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Role, User } from '../../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onLogout
}) => {
  const { currentUser, role, updateUser, logout } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [location, setLocation] = useState(currentUser?.location || 'Ongole, Andhra Pradesh');
  const [vehicleType, setVehicleType] = useState(currentUser?.vehicleType || 'Mini Truck');
  const [vehicleNumber, setVehicleNumber] = useState(currentUser?.vehicleNumber || 'AP 27 XY 1024');
  const [fpoName, setFpoName] = useState(currentUser?.fpoName || 'Prakasam Rythu Mitra FPO');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'details'>('profile');

  if (!isOpen || !currentUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateUser({
        name,
        phone,
        address,
        location,
        vehicleType: role === 'logisticsProvider' ? (vehicleType as any) : undefined,
        vehicleNumber: role === 'logisticsProvider' ? vehicleNumber : undefined,
        fpoName: role === 'fpo' ? fpoName : undefined
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    if (onLogout) onLogout();
    onClose();
  };

  const getRoleTheme = () => {
    switch (role) {
      case 'farmer':
        return {
          badge: 'Verified Farmer Producer',
          color: 'bg-emerald-600',
          lightBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <Sprout className="w-5 h-5 text-emerald-600" />
        };
      case 'fpo':
        return {
          badge: 'Registered FPO Operator',
          color: 'bg-teal-600',
          lightBg: 'bg-teal-50 text-teal-800 border-teal-200',
          icon: <Building className="w-5 h-5 text-teal-600" />
        };
      case 'customer':
        return {
          badge: 'Verified Retail Customer (1-5 kg)',
          color: 'bg-sky-600',
          lightBg: 'bg-sky-50 text-sky-800 border-sky-200',
          icon: <UserIcon className="w-5 h-5 text-sky-600" />
        };
      case 'bulkBuyer':
        return {
          badge: 'Institutional Bulk Procurer',
          color: 'bg-amber-600',
          lightBg: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <Building className="w-5 h-5 text-amber-600" />
        };
      case 'logisticsProvider':
        return {
          badge: 'Authorized Logistics Fleet Carrier',
          color: 'bg-indigo-600',
          lightBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: <Truck className="w-5 h-5 text-indigo-600" />
        };
      case 'admin':
        return {
          badge: 'Platform Superadmin (mahendra@123 Verified)',
          color: 'bg-rose-600',
          lightBg: 'bg-rose-50 text-rose-800 border-rose-200',
          icon: <ShieldCheck className="w-5 h-5 text-rose-600" />
        };
      default:
        return {
          badge: 'Registered Member',
          color: 'bg-slate-700',
          lightBg: 'bg-slate-50 text-slate-800 border-slate-200',
          icon: <UserIcon className="w-5 h-5 text-slate-600" />
        };
    }
  };

  const theme = getRoleTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title="Close Profile"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex items-center space-x-4 pb-4 border-b border-slate-200">
          <div className={`w-14 h-14 rounded-2xl ${theme.color} text-white flex items-center justify-center shadow-md font-bold text-xl`}>
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">{currentUser.name}</h2>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${theme.lightBg}`}>
                {role?.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{theme.badge}</p>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Aadhaar & AP Government Direct Farmer Portal KYC Verified</span>
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Profile details updated successfully across Kisaan2Karidhar!</span>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 mt-4 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Personal & Contact Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-2 px-3 border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Role Credentials & Bank Payouts
          </button>
        </div>

        {/* Tab 1: Personal & Contact */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-xs text-slate-500 font-mono cursor-not-allowed"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Official identifier linked to authentication token.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pickup / Delivery Address</label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">District / Town</label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  />
                  <Building className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            {/* Role specific inputs */}
            {role === 'logisticsProvider' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Mini Truck">Mini Truck (Tata Ace)</option>
                    <option value="Pickup Truck">Pickup Truck (Bolero)</option>
                    <option value="Auto">Cargo Auto (Piaggio)</option>
                    <option value="Truck">Heavy Truck (10 Ton)</option>
                    <option value="Refrigerated Vehicle">Refrigerated Reefer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vehicle Number Plate</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono uppercase"
                  />
                </div>
              </div>
            )}

            {role === 'fpo' && (
              <div className="pt-1">
                <label className="block font-bold text-slate-700 mb-1">FPO Society Name</label>
                <input
                  type="text"
                  value={fpoName}
                  onChange={(e) => setFpoName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                />
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={handleLogoutClick}
                className="px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out / Switch</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Role Credentials & Payouts */}
        {activeTab === 'details' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between font-semibold text-slate-800 pb-2 border-b border-slate-200">
                <span>Role Credentials & Compliance</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  ACTIVE
                </span>
              </div>

              {role === 'farmer' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Farm Cultivation Acreage:</span>
                    <strong className="text-slate-900">4.5 Acres (Santhanuthalapadu Mandal)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Major Crops:</span>
                    <strong className="text-slate-900">Tomato, Guntur Red Chilli, Rice</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Settlement Account (UPI VPA):</span>
                    <strong className="text-emerald-700 font-mono">ramesh.reddy@okaxis</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Intermediary Brokerage Saved:</span>
                    <strong className="text-emerald-600 font-bold">₹18,450 Direct To Farmer</strong>
                  </div>
                </>
              )}

              {role === 'fpo' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">FPO Reg No:</span>
                    <strong className="text-slate-900 font-mono">AP-FPO-2024-ONG-402</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Affiliated Farmers:</span>
                    <strong className="text-slate-900">128 Registered Smallholders</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Aggregation Yard:</span>
                    <strong className="text-slate-900">APMC Market Yard Gate 2, Ongole</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Live Aggregated Tonnage:</span>
                    <strong className="text-teal-700 font-bold">18,500 kg Ready for Bulk Dispatch</strong>
                  </div>
                </>
              )}

              {role === 'customer' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Delivery Tier:</span>
                    <strong className="text-slate-900">Direct Farm-to-Door (1–5 kg packs)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Delivery Address:</span>
                    <strong className="text-slate-900">{address || 'Flat 402, Green Meadows, Trunk Road, Ongole'}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Preferred Payment:</span>
                    <strong className="text-sky-700 font-mono">UPI / PhonePe / GPay</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Average Delivery Time:</span>
                    <strong className="text-emerald-700">15–20 minutes via Suresh Express Fleet</strong>
                  </div>
                </>
              )}

              {role === 'bulkBuyer' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Institutional Procurement Entity:</span>
                    <strong className="text-slate-900">Ananya Foods & Agro Processing</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">GSTIN:</span>
                    <strong className="text-slate-900 font-mono">37AAAAA0000A1Z5</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Procurement Focus:</span>
                    <strong className="text-amber-800 font-medium">Tomato (Puree/Paste), Grade A Chilli</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Escrow Guarantee Mode:</span>
                    <strong className="text-emerald-700">Instant Release upon Destination Delivery</strong>
                  </div>
                </>
              )}

              {role === 'logisticsProvider' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Fleet Carrier:</span>
                    <strong className="text-slate-900">Suresh Express Logistics</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Commercial Permit:</span>
                    <strong className="text-slate-900 font-mono">AP-TR-2025-ONG-0012</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Base Tariff Structure:</span>
                    <strong className="text-indigo-700">₹20 (&lt;3km) • ₹30 (&lt;5km) • ₹50 (&lt;10km) • ₹80 (&lt;15km)</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">GPS Route Optimization:</span>
                    <strong className="text-emerald-700">Dynamic Corridor Matching Enabled</strong>
                  </div>
                </>
              )}

              {role === 'admin' && (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Platform Administrator:</span>
                    <strong className="text-slate-900">Mahendra (Central Admin Controller)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Superadmin Passkey:</span>
                    <strong className="text-rose-700 font-mono">mahendra@123 [VALIDATED]</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Regulatory Oversight:</span>
                    <strong className="text-slate-900">All 6 Ecosystem Sectors Managed</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">System Integrity:</span>
                    <strong className="text-emerald-600 font-bold">100% SECURE & AUDITED</strong>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
