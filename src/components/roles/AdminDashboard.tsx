import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Sprout,
  Building2,
  ShoppingBag,
  Factory,
  Truck,
  DollarSign,
  Package,
  TrendingUp,
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { User, Order, ProduceListing, BuyerRequirement } from '../../types';

interface AdminDashboardProps {
  onBack?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [produce, setProduce] = useState<ProduceListing[]>([]);
  const [buyerReqs, setBuyerReqs] = useState<BuyerRequirement[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders' | 'payments' | 'produce'>('overview');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, ordersRes, produceRes, reqsRes] = await Promise.all([
        api.getUsers(),
        api.getOrders(),
        api.getProduce(),
        api.getBuyerRequirements()
      ]);
      setUsers(usersRes);
      setOrders(ordersRes);
      setProduce(produceRes);
      setBuyerReqs(reqsRes);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to deactivate and remove ${userName} from the platform?`)) return;
    try {
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setAdminNotice(`Successfully removed user ${userName} from platform.`);
      setTimeout(() => setAdminNotice(null), 4000);
    } catch (err) {
      console.error('Failed to remove user:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: any) => {
    try {
      await api.updateOrderStatus(orderId, newStatus, undefined, `Status updated by Admin Mahendra`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
      setAdminNotice(`Order #${orderId} status updated to ${newStatus}.`);
      setTimeout(() => setAdminNotice(null), 4000);
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const handleDeleteProduce = async (produceId: string, crop: string) => {
    if (!window.confirm(`Remove ${crop} listing from the marketplace?`)) return;
    try {
      await api.deleteProduce(produceId);
      setProduce(prev => prev.filter(p => p.id !== produceId));
      setAdminNotice(`Produce listing ${crop} removed by Admin.`);
      setTimeout(() => setAdminNotice(null), 4000);
    } catch (err) {
      console.error('Failed to delete produce:', err);
    }
  };

  // Counts by role
  const countFarmers = users.filter(u => u.role === 'farmer').length;
  const countFpos = users.filter(u => u.role === 'fpo').length;
  const countCustomers = users.filter(u => u.role === 'customer').length;
  const countBulkBuyers = users.filter(u => u.role === 'bulkBuyer').length;
  const countLogistics = users.filter(u => u.role === 'logisticsProvider').length;
  const totalGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalLogisticsFees = orders.reduce((sum, o) => sum + o.logisticsCharge, 0);

  // User breakdown chart data
  const userTypeData = [
    { name: 'Farmers', count: countFarmers, color: '#10b981' },
    { name: 'FPOs', count: countFpos, color: '#0d9488' },
    { name: 'Customers', count: countCustomers, color: '#0284c7' },
    { name: 'Bulk Buyers', count: countBulkBuyers, color: '#d97706' },
    { name: 'Logistics', count: countLogistics, color: '#6366f1' }
  ];

  // Orders chart data
  const ordersByStatus = [
    { status: 'DELIVERED', count: orders.filter(o => o.orderStatus === 'DELIVERED').length },
    { status: 'IN_TRANSIT', count: orders.filter(o => ['ACCEPTED', 'PICKUP_STARTED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.orderStatus)).length },
    { status: 'PENDING', count: orders.filter(o => o.orderStatus === 'PENDING').length }
  ];

  const filteredUsers = users.filter(u => {
    const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const matchQuery = (u?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (u?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchRole && matchQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Status Bar */}
      <div className="flex items-center justify-end gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-800 rounded-lg border border-rose-200 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
          <span>Platform Administrator: Mahendra</span>
        </span>
        <span className="hidden sm:inline text-slate-400">•</span>
        <span className="hidden sm:inline text-slate-600 font-medium">
          Passkey: <span className="font-mono text-emerald-700 font-bold">mahendra@123 [VALIDATED]</span>
        </span>
      </div>

      {/* Admin Notice Notification */}
      {adminNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{adminNotice}</span>
          </div>
          <button onClick={() => setAdminNotice(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Banner */}
      <div className="bg-gradient-to-r from-rose-900 to-slate-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-rose-800/60 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <ShieldCheck className="w-4 h-4 text-rose-300" />
            <span>Central Platform Command & Platform Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Platform Master Console (Admin: Mahendra)
          </h1>
          <p className="text-xs sm:text-sm text-rose-100 mt-1">
            Real-time management over all users, marketplace produce, transactions, and live delivery pipelines.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 text-xs flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono font-bold text-slate-100">PASSKEY VERIFIED • mahendra@123</span>
        </div>
      </div>

      {/* Six Roles Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="text-slate-500 text-[11px] font-bold flex items-center gap-1">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Farmers</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{countFarmers}</div>
          <div className="text-[10px] text-emerald-700 font-semibold">Producers</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="text-slate-500 text-[11px] font-bold flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-teal-600" />
            <span>FPOs</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{countFpos}</div>
          <div className="text-[10px] text-teal-700 font-semibold">Aggregators</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="text-slate-500 text-[11px] font-bold flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-sky-600" />
            <span>Customers</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{countCustomers}</div>
          <div className="text-[10px] text-sky-700 font-semibold">Households</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="text-slate-500 text-[11px] font-bold flex items-center gap-1">
            <Factory className="w-3.5 h-3.5 text-amber-600" />
            <span>Bulk Buyers</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{countBulkBuyers}</div>
          <div className="text-[10px] text-amber-700 font-semibold">Institutional</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <div className="text-slate-500 text-[11px] font-bold flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Logistics</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{countLogistics}</div>
          <div className="text-[10px] text-indigo-700 font-semibold">Fleet partners</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs bg-gradient-to-br from-white to-rose-50/40">
          <div className="text-slate-500 text-[11px] font-bold flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-rose-600" />
            <span>Total GMV</span>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">₹{totalGMV}</div>
          <div className="text-[10px] text-rose-700 font-semibold">{orders.length} orders total</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        {[
          { id: 'overview', label: 'Ecosystem Analytics' },
          { id: 'users', label: `Users & Roles (${users.length})` },
          { id: 'orders', label: `All Orders (${orders.length})` },
          { id: 'payments', label: 'Payment Ledger (Sandbox)' },
          { id: 'produce', label: `All Produce Listings (${produce.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`tab-admin-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-rose-700 text-rose-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Ecosystem Analytics */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">User Network Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Participants by agricultural marketplace archetype</p>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userTypeData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#e11d48" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Order Pipeline Statuses</h3>
            <p className="text-xs text-slate-500 mb-4">Delivery execution breakdown across all channels</p>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ordersByStatus}>
                  <XAxis dataKey="status" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Users & Roles Management */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Platform Users Database</h3>
              <p className="text-xs text-slate-500">Verified participant accounts across 5 ecosystem roles</p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                id="filter-admin-user-role"
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-semibold"
              >
                <option value="all">All Roles ({users.length})</option>
                <option value="farmer">Farmers ({countFarmers})</option>
                <option value="fpo">FPOs ({countFpos})</option>
                <option value="customer">Customers ({countCustomers})</option>
                <option value="bulkBuyer">Bulk Buyers ({countBulkBuyers})</option>
                <option value="logisticsProvider">Logistics ({countLogistics})</option>
              </select>

              <input
                type="text"
                placeholder="Search name/email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Email & Phone</th>
                  <th className="py-2.5 px-3">Location / Address</th>
                  <th className="py-2.5 px-3">Role Specifics</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{u?.name || 'User'}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <div>{u.email}</div>
                      <div className="text-[10px] text-slate-400">{u.phone}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[180px]">{u.address || u.location}</td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {u.role === 'logisticsProvider' && `${u.vehicleType} (${u.vehicleNumber})`}
                      {u.role === 'fpo' && `${u.fpoName || 'FPO Entity'}`}
                      {u.role === 'farmer' && 'Direct Producer'}
                      {u.role === 'customer' && '1–5 kg Household'}
                      {u.role === 'bulkBuyer' && 'Institutional Procurer'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                        Active
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name || 'User')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-colors"
                        title="Deactivate / Remove user"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>Remove</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: All Orders */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Platform Orders & Dispatches</h3>
            <p className="text-xs text-slate-500">Live order states across all buyers and fulfillment providers</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Farmer</th>
                  <th className="py-2.5 px-3">Produce</th>
                  <th className="py-2.5 px-3">Product Amt</th>
                  <th className="py-2.5 px-3">Logistics Fee</th>
                  <th className="py-2.5 px-3">Total Paid</th>
                  <th className="py-2.5 px-3">Delivery Status</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Admin Pipeline Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">#{o.id}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{o.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-700">{o.farmerName}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {o.quantity} {o.unit} {o.productName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-semibold">₹{o.productAmount}</td>
                    <td className="py-2.5 px-3 text-slate-700 font-semibold">₹{o.logisticsCharge}</td>
                    <td className="py-2.5 px-3 font-extrabold text-emerald-700 text-sm">₹{o.totalAmount}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        o.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                        {o.paymentStatus} ({o.paymentMethod || 'UPI'})
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded text-[11px] font-semibold text-slate-800 shadow-xs focus:ring-1 focus:ring-rose-500"
                        title="Update order status in live pipeline"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="ACCEPTED">ACCEPTED</option>
                        <option value="PICKUP_STARTED">PICKUP_STARTED</option>
                        <option value="PICKED_UP">PICKED_UP</option>
                        <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Payments / Ledger */}
      {activeTab === 'payments' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Mock / Sandbox Payment Ledger</h3>
            <p className="text-xs text-slate-500">
              Stores transaction records: Payment ID, Order ID, Amount, Status, Timestamp, Method. Zero sensitive bank data stored.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Payment ID</th>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Logistics Share</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-rose-800">
                      PAY-2026-{o.id.toUpperCase()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold">ORD-#{o.id}</td>
                    <td className="py-2.5 px-3">{o.paymentMethod || 'UPI (Google Pay)'}</td>
                    <td className="py-2.5 px-3 font-extrabold text-slate-900">₹{o.totalAmount}</td>
                    <td className="py-2.5 px-3 text-slate-600">₹{o.logisticsCharge}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        SUCCESS
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {new Date(o.createdAt).toISOString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Produce Listings */}
      {activeTab === 'produce' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">All Live Marketplace Produce</h3>
            <p className="text-xs text-slate-500">Listings from individual farmers and aggregated FPO lots</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Crop</th>
                  <th className="py-2.5 px-3">Supplier / Farmer</th>
                  <th className="py-2.5 px-3">Available Quantity</th>
                  <th className="py-2.5 px-3">Quality</th>
                  <th className="py-2.5 px-3">Asking Price</th>
                  <th className="py-2.5 px-3">Harvest Location</th>
                  <th className="py-2.5 px-3">Availability</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {produce.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{p.product}</td>
                    <td className="py-2.5 px-3 text-slate-800">{p.farmerName}</td>
                    <td className="py-2.5 px-3 font-extrabold text-slate-900">{p.quantity} {p.unit}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {p.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">₹{p.askingPrice}/{p.unit}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.pickupLocation}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {p.availability}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteProduce(p.id, p.product)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold transition-colors"
                        title="Unlist marketplace produce"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>Unlist</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
