import React, { useState, useEffect } from 'react';
import {
  Sprout,
  PlusCircle,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Edit2,
  Trash2,
  Sparkles,
  RefreshCw,
  X,
  MapPin,
  Calendar,
  Check,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { ProduceListing, Order, MarketPrice, DemandPrediction } from '../../types';

interface FarmerDashboardProps {
  onNavigateDetail?: (view: string, id?: string) => void;
  onBack?: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [demandForecast, setDemandForecast] = useState<DemandPrediction | null>(null);
  const [selectedCropForecast, setSelectedCropForecast] = useState('Tomato');
  const [isLoading, setIsLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    product: 'Tomato',
    quantity: '500',
    unit: 'kg',
    grade: 'Grade A' as 'Grade A' | 'Grade B' | 'Grade C',
    askingPrice: '28',
    expectedHarvestDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    farmAddress: 'Plot 14, Santhanuthalapadu Road, Ongole',
    pickupLocation: 'Ongole South Gate',
    availability: 'Available' as 'Available' | 'Sold Out' | 'Harvesting Soon'
  });

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, ordersRes, mpRes] = await Promise.all([
        api.getProduce({ farmerId: currentUser?.id }),
        api.getOrders({ farmerId: currentUser?.id }),
        api.getMarketPrices()
      ]);
      setListings(prodRes);
      setOrders(ordersRes);
      setMarketPrices(mpRes);

      // Fetch AI forecast
      const forecast = await api.getDemandForecast(selectedCropForecast, 'Ongole / Andhra Pradesh');
      setDemandForecast(forecast);
    } catch (err) {
      console.error('Error fetching farmer data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser, selectedCropForecast]);

  const handleRefreshForecast = async (crop: string) => {
    setSelectedCropForecast(crop);
    setIsAiLoading(true);
    try {
      const forecast = await api.getDemandForecast(crop, 'Ongole / Andhra Pradesh');
      setDemandForecast(forecast);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      product: 'Tomato',
      quantity: '500',
      unit: 'kg',
      grade: 'Grade A',
      askingPrice: '28',
      expectedHarvestDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      farmAddress: currentUser?.address || 'Ongole Farm Lands',
      pickupLocation: 'Ongole South Gate',
      availability: 'Available'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ProduceListing) => {
    setEditingId(item.id);
    setFormData({
      product: item.product,
      quantity: String(item.quantity),
      unit: item.unit,
      grade: item.grade,
      askingPrice: String(item.askingPrice),
      expectedHarvestDate: item.expectedHarvestDate,
      farmAddress: item.farmAddress,
      pickupLocation: item.pickupLocation,
      availability: item.availability
    });
    setIsModalOpen(true);
  };

  const handleSaveProduce = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateProduce(editingId, {
          product: formData.product,
          quantity: Number(formData.quantity),
          unit: formData.unit,
          grade: formData.grade,
          askingPrice: Number(formData.askingPrice),
          expectedHarvestDate: formData.expectedHarvestDate,
          farmAddress: formData.farmAddress,
          pickupLocation: formData.pickupLocation,
          availability: formData.availability
        });
      } else {
        await api.addProduce({
          farmerId: currentUser?.id || 'farmer-1',
          farmerName: currentUser?.name || 'Ramesh Reddy',
          farmerPhone: currentUser?.phone || '+91 98480 12345',
          product: formData.product,
          quantity: Number(formData.quantity),
          unit: formData.unit,
          grade: formData.grade,
          askingPrice: Number(formData.askingPrice),
          expectedHarvestDate: formData.expectedHarvestDate,
          farmAddress: formData.farmAddress,
          pickupLocation: formData.pickupLocation,
          availability: formData.availability
        });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Error saving produce:', err);
    }
  };

  const handleDeleteProduce = async (id: string) => {
    try {
      await api.deleteProduce(id);
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const activeListingsCount = listings.filter(l => l.availability === 'Available').length;
  const totalProduceVolume = listings.reduce((sum, l) => sum + l.quantity, 0);
  const pendingOrdersCount = orders.filter(o => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED').length;
  const completedOrdersCount = orders.filter(o => o.orderStatus === 'DELIVERED').length;
  const totalEarnings = orders
    .filter(o => o.orderStatus === 'DELIVERED')
    .reduce((sum, o) => sum + o.productAmount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Status & Farm Info Bar */}
      <div className="flex items-center justify-end gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-semibold">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{currentUser?.address || 'Ongole District, AP'}</span>
        </span>
        <span className="hidden sm:inline text-slate-400">•</span>
        <span className="hidden sm:inline text-slate-600 font-medium">
          Active Farm ID: <span className="font-mono text-slate-800 font-bold">{currentUser?.id || 'FARM-101'}</span>
        </span>
      </div>

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-emerald-700/60 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sprout className="w-4 h-4 text-emerald-300" />
            <span>Kisaan Direct Producer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Namaste, {currentUser?.name || 'Ramesh Reddy'}!
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            Manage your produce listings, track fair farmgate prices, and fulfill local orders with verified logistics.
          </p>
        </div>

        <button
          id="btn-farmer-add-produce"
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-emerald-700" />
          <span>{t('addProduce')}</span>
        </button>
      </div>

      {/* Five Dashboard Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{t('activeListings')}</span>
            <Package className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{activeListingsCount}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Ready for buyers</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{t('totalProduce')}</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalProduceVolume} <span className="text-sm font-semibold text-slate-500">kg</span></div>
          <div className="text-[11px] text-slate-500 mt-1">Across all crops</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{t('pendingOrders')}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{pendingOrdersCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">In transit / assigned</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{t('completedOrders')}</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600">{completedOrdersCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Delivered successfully</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">{t('earnings')}</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">₹{totalEarnings}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Direct farm payout</div>
        </div>

      </div>

      {/* Produce Listings Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Produce Listings</h2>
            <p className="text-xs text-slate-500">Live inventory visible to small-scale customers and bulk aggregators</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add New Crop</span>
          </button>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <Sprout className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">No produce listings yet</p>
            <button
              onClick={handleOpenAdd}
              className="mt-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold"
            >
              Add Your First Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 hover:bg-white hover:border-emerald-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {item.grade}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5">{item.product}</h3>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.availability === 'Available' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.availability}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Quantity Available:</span>
                      <span className="font-bold text-slate-900">{item.quantity} {item.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Asking Price:</span>
                      <span className="font-extrabold text-emerald-700 text-sm">₹{item.askingPrice}/{item.unit}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Harvest: {item.expectedHarvestDate}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{item.pickupLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                  <button
                    id={`btn-edit-produce-${item.id}`}
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit listing"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    id={`btn-delete-produce-${item.id}`}
                    onClick={() => setDeleteConfirmId(item.id)}
                    className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Market Prices & AI Demand Forecast Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Market Price Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('marketPrices')} (Mandi Benchmarks)</h2>
              <p className="text-xs text-slate-500">Compare regional APMC rates vs your asking price</p>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-medium">
              Live Mandi Feeds
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Current Market Price</th>
                  <th className="py-2.5 px-3">Historical Price</th>
                  <th className="py-2.5 px-3">Price Difference</th>
                  <th className="py-2.5 px-3">Market Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marketPrices.map((mp) => (
                  <tr key={mp.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{mp.product}</td>
                    <td className="py-2.5 px-3 font-extrabold text-slate-800">₹{mp.currentPrice}/kg</td>
                    <td className="py-2.5 px-3 text-slate-500">₹{mp.historicalPrice}/kg</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px] ${
                        mp.priceDifference >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {mp.priceDifference >= 0 ? `+₹${mp.priceDifference}` : `-₹${Math.abs(mp.priceDifference)}`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">{mp.marketLocation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Demand & Recommendation Section */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-800">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{t('demandForecast')} & AI Recommendations</h2>
                  <p className="text-[11px] text-slate-500">Predictive intelligence powered by market signals</p>
                </div>
              </div>

              {/* Crop switcher */}
              <div className="flex items-center space-x-1">
                {['Tomato', 'Onion', 'Chilli'].map((crop) => (
                  <button
                    key={crop}
                    onClick={() => handleRefreshForecast(crop)}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors ${
                      selectedCropForecast === crop
                        ? 'bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {demandForecast && (
              <div className="space-y-3">
                {/* Demand Level Badges */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Current Demand</span>
                    <div className="text-sm font-extrabold text-slate-800 mt-0.5">{demandForecast.currentDemand}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Predicted Demand</span>
                    <div className="text-sm font-extrabold text-emerald-700 mt-0.5">{demandForecast.predictedDemandChange}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Demand Level</span>
                    <div className="text-sm font-extrabold text-blue-600 mt-0.5">{demandForecast.demandLevel}</div>
                  </div>
                </div>

                {/* AI Recommendation Quote */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl text-xs">
                  <span className="font-bold text-emerald-900 block mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    AI Actionable Recommendation:
                  </span>
                  <p className="text-emerald-950 font-medium italic leading-relaxed">
                    "{demandForecast.recommendation}"
                  </p>
                </div>

                {/* Suggested Price Range */}
                {demandForecast.suggestedPriceRange && (
                  <div className="flex items-center justify-between text-xs p-2.5 bg-slate-100 rounded-lg text-slate-700">
                    <span>Suggested Optimal Listing Price:</span>
                    <span className="font-extrabold text-slate-900">
                      ₹{demandForecast.suggestedPriceRange.min} – ₹{demandForecast.suggestedPriceRange.max}/{demandForecast.suggestedPriceRange.unit}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Confidence Score: {demandForecast?.confidenceScore || 92}%</span>
            <button
              onClick={() => handleRefreshForecast(selectedCropForecast)}
              disabled={isAiLoading}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isAiLoading ? 'animate-spin' : ''}`} />
              <span>Refresh AI Model</span>
            </button>
          </div>
        </div>

      </div>

      {/* Orders Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">Incoming & Delivered Orders</h2>
        <p className="text-xs text-slate-500 mb-4">Orders placed by customers for your produce</p>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No incoming orders yet. When a customer purchases your crop, it will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Product & Qty</th>
                  <th className="py-2.5 px-3">Crop Value</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Logistics Fleet</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-emerald-800">#{order.id}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{order.customerName}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {order.quantity} {order.unit} {order.productName} ({order.grade})
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-emerald-700">₹{order.productAmount}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.orderStatus === 'ACCEPTED' || order.orderStatus === 'OUT_FOR_DELIVERY'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                      {order.assignedLogisticsName || 'Suresh Logistics'} ({order.assignedVehicleType || 'Mini Truck'})
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Produce Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingId ? 'Edit Produce Listing' : 'Add New Produce Listing'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your crop specification, asking price, and harvest location.
            </p>

            <form onSubmit={handleSaveProduce} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product / Crop</label>
                  <select
                    id="input-produce-product"
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Potato">Potato</option>
                    <option value="Onion">Onion</option>
                    <option value="Chilli">Chilli</option>
                    <option value="Rice">Rice</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Maize">Maize</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Grade / Quality</label>
                  <select
                    id="input-produce-grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Grade A">Grade A (Premium)</option>
                    <option value="Grade B">Grade B (Standard)</option>
                    <option value="Grade C">Grade C (Processing)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    id="input-produce-quantity"
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                    <option value="ton">ton</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Asking Price (₹/unit)</label>
                  <input
                    id="input-produce-price"
                    type="number"
                    min="1"
                    required
                    value={formData.askingPrice}
                    onChange={(e) => setFormData({ ...formData, askingPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Harvest Date</label>
                  <input
                    id="input-produce-harvest-date"
                    type="date"
                    required
                    value={formData.expectedHarvestDate}
                    onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Farm Address</label>
                <input
                  id="input-produce-farm-address"
                  type="text"
                  required
                  value={formData.farmAddress}
                  onChange={(e) => setFormData({ ...formData, farmAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pickup Location</label>
                <input
                  id="input-produce-pickup-location"
                  type="text"
                  required
                  placeholder="e.g. Ongole South Gate"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Availability Status</label>
                <select
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Available">Available</option>
                  <option value="Harvesting Soon">Harvesting Soon</option>
                  <option value="Sold Out">Sold Out</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  id="btn-save-produce"
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  {editingId ? 'Save Changes' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-rose-200 rounded-2xl max-w-sm w-full p-5 shadow-xl text-center">
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Delete Produce Listing?</h4>
            <p className="text-xs text-slate-500 mt-1">
              This action cannot be undone and will remove the crop from buyer views.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2 px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-produce"
                onClick={() => handleDeleteProduce(deleteConfirmId)}
                className="py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
