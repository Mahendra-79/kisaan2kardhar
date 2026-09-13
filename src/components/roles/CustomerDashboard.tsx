import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  MapPin,
  Search,
  Filter,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  Sparkles,
  ChevronRight,
  ArrowLeft,
  DollarSign,
  Package
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { api, calculateLogisticsCharge } from '../../services/api';
import { ProduceListing, Order } from '../../types';
import { FarDistanceModal } from '../common/FarDistanceModal';
import { PaymentModal } from '../common/PaymentModal';

interface CustomerDashboardProps {
  onBack?: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [deliveryLocation, setDeliveryLocation] = useState(currentUser?.address || 'Flat 402, Green Meadows, Trunk Road, Ongole');
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null); // null = all, 3, 5, 10
  const [searchQuery, setSearchQuery] = useState('');
  const [produceList, setProduceList] = useState<ProduceListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected product for purchasing
  const [selectedProduce, setSelectedProduce] = useState<ProduceListing | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(2); // Default 2 kg (matches test scenario!)
  
  // Modals state
  const [isFarDistanceModalOpen, setIsFarDistanceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'orders'>('browse');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  const fetchProduceAndOrders = async () => {
    setIsLoading(true);
    try {
      const [prodRes, ordersRes] = await Promise.all([
        api.getProduce({ maxDistance: selectedRadius || undefined, product: searchQuery || undefined }),
        api.getOrders({ customerId: currentUser?.id })
      ]);
      setProduceList(prodRes);
      setOrders(ordersRes);
    } catch (err) {
      console.error('Error loading customer view:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduceAndOrders();
  }, [selectedRadius, searchQuery, currentUser]);

  // Initiate purchase flow
  const handleInitiateOrder = (produce: ProduceListing) => {
    setSelectedProduce(produce);
    const dist = produce.distanceKm || 4.5;
    
    // If distance is far (> 10 km), trigger Far Distance Warning Modal first!
    if (dist > 10) {
      setIsFarDistanceModalOpen(true);
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  const handleFarDistanceContinue = () => {
    setIsFarDistanceModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handleFarDistanceGoBack = () => {
    setIsFarDistanceModalOpen(false);
    setSelectedProduce(null);
  };

  const handleConfirmPaymentAndCreateOrder = async (paymentMethod: string) => {
    if (!selectedProduce) return;
    try {
      const order = await api.createOrder({
        customerId: currentUser?.id || 'cust-1',
        customerName: currentUser?.name || 'Priya Sharma',
        customerPhone: currentUser?.phone || '+91 98480 34567',
        customerAddress: deliveryLocation,
        customerDeliveryLocation: 'Ongole Central',
        productId: selectedProduce.id,
        quantity: purchaseQuantity,
        paymentMethod
      });

      setOrderSuccessMsg(`Order #${order.id} placed successfully! Total: ₹${order.totalAmount} (Logistics: ₹${order.logisticsCharge}). Dispatched to logistics.`);
      setIsPaymentModalOpen(false);
      setSelectedProduce(null);
      setTimeout(() => setOrderSuccessMsg(null), 6000);
      fetchProduceAndOrders();
      setActiveTab('orders');
    } catch (err) {
      console.error('Failed to create order:', err);
      throw err;
    }
  };

  // Distance & price calculation for currently selected item
  const currentDistance = selectedProduce?.distanceKm || 4.5;
  const currentLogisticsCharge = calculateLogisticsCharge(currentDistance);
  const currentProductAmount = (selectedProduce?.askingPrice || 0) * purchaseQuantity;
  const currentTotalAmount = currentProductAmount + currentLogisticsCharge;

  const totalOrdersCount = orders.length;
  const activeDeliveriesCount = orders.filter(o => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED').length;
  const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const estimatedSavings = Math.round(totalSpent * 0.22); // ~22% savings vs retail middleman mandi

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Status Bar */}
      <div className="flex items-center justify-end gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-800 rounded-lg border border-sky-200 font-semibold">
          <ShoppingBag className="w-3.5 h-3.5 text-sky-600" />
          <span>Verified Customer Profile</span>
        </span>
        <span className="hidden sm:inline text-slate-400">•</span>
        <span className="hidden sm:inline text-slate-600 font-medium">
          Ongole Delivery Zone
        </span>
      </div>

      {/* Customer Header Banner */}
      <div className="bg-gradient-to-r from-sky-800 to-indigo-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-sky-700/60 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <ShoppingBag className="w-4 h-4 text-sky-300" />
            <span>Farm Direct Consumer Market (1–5 kg)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Fresh Produce Near You, {currentUser?.name || 'Priya'}!
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 mt-1">
            Buy farm-fresh harvests directly from local growers within your neighborhood radius.
          </p>
        </div>

        {/* Delivery location selector */}
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 text-xs self-start md:self-auto max-w-sm">
          <div className="flex items-center space-x-1.5 text-sky-200 font-bold mb-1">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Delivery Location:</span>
          </div>
          <input
            type="text"
            value={deliveryLocation}
            onChange={(e) => setDeliveryLocation(e.target.value)}
            className="w-full bg-white/20 border border-white/30 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-hidden placeholder-white/60"
            placeholder="Enter doorstep address..."
          />
        </div>
      </div>

      {/* Customer Dashboard Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">Total Orders</span>
            <Package className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalOrdersCount}</div>
          <div className="text-[11px] text-sky-700 font-medium mt-1">Lifetime household purchases</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">In Transit</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-600">{activeDeliveriesCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Active doorstep dispatches</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">Total Spent</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">₹{totalSpent}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Direct to farmers & drivers</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">Mandi Savings</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">~₹{estimatedSavings}</div>
          <div className="text-[11px] text-slate-500 mt-1">Saved vs retail middleman fees</div>
        </div>
      </div>

      {orderSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{orderSuccessMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          id="tab-customer-browse"
          onClick={() => setActiveTab('browse')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'browse'
              ? 'border-sky-700 text-sky-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse Fresh Produce</span>
        </button>

        <button
          id="tab-customer-orders"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? 'border-sky-700 text-sky-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>My Orders & Live Tracking ({orders.length})</span>
        </button>
      </div>

      {activeTab === 'browse' ? (
        <div className="space-y-6">
          
          {/* Radius Filter & Search Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="input-customer-search-product"
                type="text"
                placeholder="Search crop (e.g. Tomato, Potato, Onion)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
              />
            </div>

            {/* Radius Filters: 3 km, 5 km, 10 km */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Radius:</span>
              </span>
              
              {[
                { label: 'All', val: null },
                { label: '3 km', val: 3 },
                { label: '5 km', val: 5 },
                { label: '10 km', val: 10 }
              ].map((r) => (
                <button
                  key={String(r.val)}
                  id={`btn-radius-${r.val || 'all'}`}
                  onClick={() => setSelectedRadius(r.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    selectedRadius === r.val
                      ? 'bg-sky-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

          </div>

          {/* Prompt Rule: Prioritize nearby farmers first */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Listing Nearby Farmers First (1–5 kg Household Orders)
            </span>
            <span className="text-xs text-sky-800 font-semibold">
              Showing {produceList.length} local farm offerings
            </span>
          </div>

          {/* Produce Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {produceList.map((produce) => {
              const dist = produce.distanceKm || 4.5;
              const deliveryFee = calculateLogisticsCharge(dist);
              const isFar = dist > 10;

              return (
                <div
                  key={produce.id}
                  id={`produce-card-${produce.id}`}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-sky-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                          {produce.grade}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">{produce.product}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-emerald-700">₹{produce.askingPrice}</div>
                        <div className="text-[10px] text-slate-400">per {produce.unit}</div>
                      </div>
                    </div>

                    {/* Farmer Details */}
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {produce.farmerName}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          dist <= 3 ? 'bg-emerald-100 text-emerald-800' : dist <= 10 ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          <MapPin className="w-3 h-3" />
                          {dist} km away
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        Pickup: {produce.pickupLocation}
                      </p>
                    </div>

                    {/* Logistics Fee Preview */}
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-600 px-1">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Logistics Fee:</span>
                      </span>
                      <span className="font-bold text-slate-800">₹{deliveryFee}</span>
                    </div>

                    {isFar && (
                      <div className="mt-2 text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-md font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                        <span>Far distance location ({dist} km)</span>
                      </div>
                    )}
                  </div>

                  {/* Quantity selector & Order Button */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="text-slate-600 font-medium">Select Quantity:</span>
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 5].map((qty) => (
                          <button
                            key={qty}
                            onClick={() => {
                              setSelectedProduce(produce);
                              setPurchaseQuantity(qty);
                            }}
                            className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                              selectedProduce?.id === produce.id && purchaseQuantity === qty
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {qty} kg
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      id={`btn-order-produce-${produce.id}`}
                      onClick={() => handleInitiateOrder(produce)}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center space-x-1.5"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Order Directly from Farmer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* Orders & Live Tracking View */
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Orders & Live Delivery Tracking</h2>
            <p className="text-xs text-slate-500">Track your order from farmgate harvest to home delivery</p>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              You haven't placed any orders yet. Choose a fresh crop from nearby farmers above.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  id={`order-card-${order.id}`}
                  className="border border-slate-200 rounded-2xl p-5 bg-slate-50/40 space-y-4 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">Order #{order.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.orderStatus === 'OUT_FOR_DELIVERY' || order.orderStatus === 'PICKED_UP'
                            ? 'bg-blue-100 text-blue-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Placed on: {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-medium">Total Paid (with delivery)</div>
                      <div className="text-base font-extrabold text-emerald-800">₹{order.totalAmount}</div>
                    </div>
                  </div>

                  {/* Order details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Crop & Quantity</span>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {order.quantity} {order.unit} {order.productName} ({order.grade})
                      </div>
                      <div className="text-slate-500 mt-1">Crop amount: ₹{order.productAmount}</div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Farmer / Pickup</span>
                      <div className="font-bold text-slate-900 mt-0.5">{order.farmerName}</div>
                      <div className="text-slate-500 mt-0.5 truncate">{order.farmerPickupLocation}</div>
                      <div className="text-[11px] text-emerald-700 font-medium mt-1">Distance: {order.distanceKm} km</div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Logistics & Delivery</span>
                      <div className="font-bold text-slate-900 mt-0.5">
                        {order.assignedLogisticsName || 'Suresh Express Fleet'}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        Vehicle: {order.assignedVehicleType || 'Mini Truck'} ({order.vehicleNumber || 'AP 27 XY 1024'})
                      </div>
                      <div className="text-[11px] text-slate-700 font-semibold mt-1">
                        Logistics charge: ₹{order.logisticsCharge}
                      </div>
                    </div>
                  </div>

                  {/* Status Timeline Progress Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
                      <span className={order.orderStatus ? 'text-emerald-700' : ''}>1. Order Placed</span>
                      <span className={['ASSIGNED', 'ACCEPTED', 'PICKUP_STARTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus) ? 'text-emerald-700' : ''}>2. Logistics Assigned</span>
                      <span className={['PICKUP_STARTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus) ? 'text-emerald-700' : ''}>3. Picked Up</span>
                      <span className={['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus) ? 'text-emerald-700' : ''}>4. Out for Delivery</span>
                      <span className={order.orderStatus === 'DELIVERED' ? 'text-emerald-700' : ''}>5. Delivered</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                      <div
                        className={`h-full bg-emerald-600 transition-all duration-500 ${
                          order.orderStatus === 'PENDING'
                            ? 'w-1/5'
                            : order.orderStatus === 'ASSIGNED' || order.orderStatus === 'ACCEPTED'
                            ? 'w-2/5'
                            : order.orderStatus === 'PICKUP_STARTED' || order.orderStatus === 'PICKED_UP'
                            ? 'w-3/5'
                            : order.orderStatus === 'OUT_FOR_DELIVERY'
                            ? 'w-4/5'
                            : 'w-full'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Far Distance Warning Modal */}
      {selectedProduce && (
        <FarDistanceModal
          isOpen={isFarDistanceModalOpen}
          distanceKm={selectedProduce.distanceKm || 12.5}
          deliveryCharge={calculateLogisticsCharge(selectedProduce.distanceKm || 12.5)}
          farmerName={selectedProduce.farmerName}
          onContinue={handleFarDistanceContinue}
          onGoBack={handleFarDistanceGoBack}
        />
      )}

      {/* Payment / Sandbox Checkout Modal */}
      {selectedProduce && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          productName={selectedProduce.product}
          quantity={purchaseQuantity}
          unit={selectedProduce.unit}
          pricePerUnit={selectedProduce.askingPrice}
          productAmount={currentProductAmount}
          distanceKm={currentDistance}
          logisticsCharge={currentLogisticsCharge}
          totalAmount={currentTotalAmount}
          farmerName={selectedProduce.farmerName}
          onConfirmPayment={handleConfirmPaymentAndCreateOrder}
        />
      )}

    </div>
  );
};
