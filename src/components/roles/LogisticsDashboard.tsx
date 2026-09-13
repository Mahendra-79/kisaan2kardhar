import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  DollarSign,
  Navigation,
  Check,
  X,
  ArrowRight,
  Phone,
  User,
  ShieldCheck,
  AlertCircle,
  Fuel,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { Order, OrderStatus } from '../../types';
import { RouteMap } from '../common/RouteMap';

interface LogisticsDashboardProps {
  onBack?: () => void;
}

export const LogisticsDashboard: React.FC<LogisticsDashboardProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusActionLoading, setStatusActionLoading] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOrders();
      setOrders(data);
      if (data.length > 0 && !selectedOrder) {
        setSelectedOrder(data[0]);
      } else if (selectedOrder) {
        const refreshed = data.find(o => o.id === selectedOrder.id);
        if (refreshed) setSelectedOrder(refreshed);
      }
    } catch (err) {
      console.error('Failed to load logistics orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setStatusActionLoading(true);
    try {
      const updated = await api.updateOrderStatus(orderId, nextStatus);
      setSelectedOrder(updated);
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setStatusActionLoading(false);
    }
  };

  // KPIs
  const completedOrders = orders.filter(o => o.orderStatus === 'DELIVERED');
  const activeDeliveries = orders.filter(o => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED');
  const totalLogisticsEarnings = completedOrders.reduce((sum, o) => sum + o.logisticsCharge, 0);
  const avgDeliveryCharge = completedOrders.length > 0 ? Math.round(totalLogisticsEarnings / completedOrders.length) : 50;

  // Selected order route details
  const activeDistance = selectedOrder?.distanceKm || 6.2;
  const activeEtaMinutes = selectedOrder?.etaMinutes || Math.round(activeDistance * 3.5 + 10);
  const estimatedFuelCost = Math.round(activeDistance * 4.2);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Status Bar */}
      <div className="flex items-center justify-end gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-lg border border-indigo-200 font-semibold">
          <Truck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Prakasam Logistics Fleet</span>
        </span>
        <span className="hidden sm:inline text-slate-400">•</span>
        <span className="hidden sm:inline text-slate-600 font-medium">
          Vehicle: <span className="font-mono text-slate-800 font-bold">{currentUser?.vehicleNumber || 'AP 27 XY 1024'}</span>
        </span>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-indigo-700/60 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Truck className="w-4 h-4 text-indigo-300" />
            <span>Dedicated Fleet & Route Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {currentUser?.name || 'Suresh Express Logistics'}
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-1">
            Vehicle: <strong>{currentUser?.vehicleType || 'Mini Truck'}</strong> ({currentUser?.vehicleNumber || 'AP 27 XY 1024'})
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-xs">
          <div className="text-indigo-200 font-bold">Active Driver Status</div>
          <div className="text-emerald-300 font-extrabold text-sm flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>ONLINE • Ready for Dispatches</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Active Dispatches</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">{activeDeliveries.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">In transit / assigned</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Completed Runs</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{completedOrders.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Delivered to doorsteps</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Logistics Earnings</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalLogisticsEarnings}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Direct driver payout</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Avg Charge Per Run</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{avgDeliveryCharge}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Automated slab rates</div>
        </div>
      </div>

      {/* Main Logistics Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Delivery Orders Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Delivery Orders Queue</h2>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
              {orders.length}
            </span>
          </div>

          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                id={`logistics-order-${order.id}`}
                onClick={() => setSelectedOrder(order)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
                  selectedOrder?.id === order.id
                    ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-indigo-900">
                      Order #{order.id}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {order.quantity} {order.unit} {order.productName}
                    </h4>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    order.orderStatus === 'DELIVERED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.orderStatus === 'OUT_FOR_DELIVERY' || order.orderStatus === 'PICKED_UP'
                      ? 'bg-indigo-100 text-indigo-800 animate-pulse'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div className="mt-3 text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Pickup:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[140px]">{order.farmerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dropoff:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[140px]">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100">
                    <span>Logistics Fee:</span>
                    <span className="font-extrabold text-emerald-700">₹{order.logisticsCharge} ({order.distanceKm} km)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Route Optimization & Real-Time Driver Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {selectedOrder ? (
            <div className="space-y-6">
              
              {/* Active Delivery Control Center */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                      Active Dispatch Job #{selectedOrder.id}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                      {selectedOrder.quantity} {selectedOrder.unit} {selectedOrder.productName} ({selectedOrder.grade})
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500">Your Logistics Payout</span>
                    <div className="text-2xl font-black text-emerald-700">₹{selectedOrder.logisticsCharge}</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">1. Farm Pickup Point</span>
                    <div className="font-bold text-slate-900 text-sm">{selectedOrder.farmerName}</div>
                    <div className="text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>{selectedOrder.farmerPickupLocation}</span>
                    </div>
                    <div className="text-slate-500 pt-1">Farmer Contact: {selectedOrder.farmerPhone}</div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400">2. Customer Dropoff Point</span>
                    <div className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</div>
                    <div className="text-slate-600 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{selectedOrder.customerAddress}</span>
                    </div>
                    <div className="text-slate-500 pt-1">Customer Contact: {selectedOrder.customerPhone}</div>
                  </div>
                </div>

                {/* Route Optimization Metrics */}
                <div className="grid grid-cols-3 gap-3 p-3.5 bg-indigo-50/60 border border-indigo-200 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-900">Total Run Distance</span>
                    <div className="text-base font-extrabold text-indigo-950 mt-0.5">{activeDistance} km</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-900">Estimated Transit ETA</span>
                    <div className="text-base font-extrabold text-indigo-950 mt-0.5">{activeEtaMinutes} mins</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-900">Estimated Fuel Cost</span>
                    <div className="text-base font-extrabold text-indigo-950 mt-0.5">₹{estimatedFuelCost}</div>
                  </div>
                </div>

                {/* Status Progression Workflow Buttons */}
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 mb-2">
                    Current Transit Stage: <span className="text-indigo-600">{selectedOrder.orderStatus}</span>
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.orderStatus === 'PENDING' && (
                      <button
                        id="btn-logistics-accept"
                        disabled={statusActionLoading}
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'ACCEPTED')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        Accept Delivery
                      </button>
                    )}

                    {selectedOrder.orderStatus === 'ACCEPTED' && (
                      <button
                        id="btn-logistics-start-pickup"
                        disabled={statusActionLoading}
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'PICKUP_STARTED')}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Start Pickup Navigation</span>
                      </button>
                    )}

                    {selectedOrder.orderStatus === 'PICKUP_STARTED' && (
                      <button
                        id="btn-logistics-mark-picked-up"
                        disabled={statusActionLoading}
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'PICKED_UP')}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        Mark Crop as Picked Up from Farmer
                      </button>
                    )}

                    {selectedOrder.orderStatus === 'PICKED_UP' && (
                      <button
                        id="btn-logistics-out-for-delivery"
                        disabled={statusActionLoading}
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'OUT_FOR_DELIVERY')}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        Mark as Out for Delivery
                      </button>
                    )}

                    {selectedOrder.orderStatus === 'OUT_FOR_DELIVERY' && (
                      <button
                        id="btn-logistics-delivered"
                        disabled={statusActionLoading}
                        onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'DELIVERED')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Complete & Mark Delivered</span>
                      </button>
                    )}

                    {selectedOrder.orderStatus === 'DELIVERED' && (
                      <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Delivery Fulfilled. Payment credited to your wallet.</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Route Optimization Map Visualizer (EXCLUSIVELY IN LOGISTICS) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Navigation className="w-4 h-4 text-indigo-600" />
                      <span>Optimized Route & Waypoints Map</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Algorithmic shortest-path routing avoiding rural bottleneck corridors
                    </p>
                  </div>
                </div>

                <RouteMap
                  orderId={selectedOrder.id}
                  productName={selectedOrder.productName}
                  quantity={selectedOrder.quantity}
                  unit={selectedOrder.unit}
                  source={{
                    name: selectedOrder.farmerName || 'Farmer Partner',
                    pickupLocation: selectedOrder.farmerPickupLocation || 'Farm Gate',
                    address: selectedOrder.farmerAddress || 'Rural Farmgate Depot, Ongole',
                    phone: selectedOrder.farmerPhone || '+91 98480 12345'
                  }}
                  destination={{
                    name: selectedOrder.customerName || 'Customer Doorstep',
                    deliveryLocation: selectedOrder.customerDeliveryLocation || 'Doorstep',
                    address: selectedOrder.customerAddress || 'Ongole Center',
                    phone: selectedOrder.customerPhone || '+91 98480 67890'
                  }}
                  distanceKm={activeDistance}
                  estimatedMinutes={activeEtaMinutes}
                  stops={[
                    {
                      id: 'stop-1',
                      type: 'pickup',
                      title: `Farm Pickup: ${selectedOrder.farmerName}`,
                      location: selectedOrder.farmerPickupLocation,
                      distanceKm: 0,
                      timeEstimate: '0 mins'
                    },
                    {
                      id: 'stop-2',
                      type: 'dropoff',
                      title: `Customer Delivery: ${selectedOrder.customerName}`,
                      location: selectedOrder.customerAddress,
                      distanceKm: activeDistance,
                      timeEstimate: `${activeEtaMinutes} mins`
                    }
                  ]}
                  totalDistanceKm={activeDistance}
                  estimatedDuration={`${activeEtaMinutes} mins`}
                />
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-xs">
              Select an order from the left queue to view route optimization and transit controls.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
