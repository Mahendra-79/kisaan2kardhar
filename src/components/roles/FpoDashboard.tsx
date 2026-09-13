import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  Layers,
  ShoppingBag,
  TrendingUp,
  PlusCircle,
  CheckCircle2,
  Phone,
  MapPin,
  Sparkles,
  BarChart3,
  X,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { FpoMember, FpoAggregation, BuyerRequirement, Order, DemandPrediction } from '../../types';

interface FpoDashboardProps {
  onBack?: () => void;
}

export const FpoDashboard: React.FC<FpoDashboardProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [members, setMembers] = useState<FpoMember[]>([]);
  const [aggregations, setAggregations] = useState<FpoAggregation[]>([]);
  const [buyerReqs, setBuyerReqs] = useState<BuyerRequirement[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'aggregation' | 'members' | 'buyers' | 'analytics' | 'forecast'>('aggregation');
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isBulkListingModalOpen, setIsBulkListingModalOpen] = useState(false);

  // AI Price Recommendation and Demand Forecasting state
  const [selectedCropForecast, setSelectedCropForecast] = useState<string>('Tomato');
  const [demandForecast, setDemandForecast] = useState<DemandPrediction | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // New member form
  const [newMember, setNewMember] = useState({
    farmerName: '',
    phone: '',
    village: 'Santhanuthalapadu',
    crop: 'Tomato',
    quantityKg: '1000',
    grade: 'Grade A'
  });

  // Bulk listing state
  const [bulkCrop, setBulkCrop] = useState('Tomato');
  const [bulkPrice, setBulkPrice] = useState('27');
  const [listingSuccessMsg, setListingSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [membersRes, aggsRes, reqsRes, ordersRes] = await Promise.all([
        api.getFpoMembers('fpo-1'),
        api.getFpoAggregations('fpo-1'),
        api.getBuyerRequirements(),
        api.getOrders()
      ]);
      setMembers(membersRes);
      setAggregations(aggsRes);
      setBuyerReqs(reqsRes);
      setOrders(ordersRes);
    } catch (err) {
      console.error('Failed to load FPO data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchForecast = async (crop: string) => {
    setIsAiLoading(true);
    try {
      const res = await api.getDemandForecast(crop, 'Ongole / Andhra Pradesh APMC Hub');
      setDemandForecast(res);
    } catch (err) {
      console.error('Failed to load FPO demand forecast:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast(selectedCropForecast);
  }, [selectedCropForecast]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.farmerName || !newMember.quantityKg) return;

    try {
      await api.addFpoMember({
        fpoId: 'fpo-1',
        farmerName: newMember.farmerName,
        phone: newMember.phone || '+91 98481 00000',
        village: newMember.village,
        crop: newMember.crop,
        quantityKg: Number(newMember.quantityKg),
        grade: newMember.grade
      });
      setIsAddMemberModalOpen(false);
      setNewMember({
        farmerName: '',
        phone: '',
        village: 'Santhanuthalapadu',
        crop: 'Tomato',
        quantityKg: '1000',
        grade: 'Grade A'
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishBulkListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const agg = aggregations.find(a => a.crop === bulkCrop);
      const totalQty = agg ? agg.totalQuantityKg : 5000;
      await api.addProduce({
        farmerId: 'fpo-1',
        farmerName: 'Prakasam Rythu Mitra FPO (Aggregated)',
        farmerPhone: '+91 98480 23456',
        product: bulkCrop,
        quantity: totalQty,
        unit: 'kg',
        grade: 'Grade A',
        askingPrice: Number(bulkPrice),
        expectedHarvestDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        farmAddress: 'FPO Aggregation Yard, APMC Yard, Ongole',
        pickupLocation: 'APMC Market Yard Gate 2, Ongole',
        availability: 'Available'
      });
      setListingSuccessMsg(`Successfully published aggregated ${totalQty} kg ${bulkCrop} listing to live marketplace!`);
      setIsBulkListingModalOpen(false);
      setTimeout(() => setListingSuccessMsg(null), 4000);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Analytics data for Recharts
  const chartData = aggregations.map(a => ({
    crop: a.crop,
    volumeKg: a.totalQuantityKg,
    members: a.memberCount
  }));

  const totalMemberFarmers = members.length;
  const totalAggregatedVolumeKg = aggregations.reduce((sum, a) => sum + a.totalQuantityKg, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Status Bar */}
      <div className="flex items-center justify-end gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg border border-teal-200 font-semibold">
          <Building2 className="w-3.5 h-3.5 text-teal-600" />
          <span>Ongole Central Hub</span>
        </span>
        <span className="hidden sm:inline text-slate-400">•</span>
        <span className="hidden sm:inline text-slate-600 font-medium">
          FPO Reg: <span className="font-mono text-slate-800 font-bold">FPO-AP-2024</span>
        </span>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-teal-700/60 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Building2 className="w-4 h-4 text-teal-300" />
            <span>Farmer Producer Organization Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {currentUser?.fpoName || 'Prakasam Rythu Mitra FPO'}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 mt-1">
            Aggregating smallholder crops into high-volume institutional lots for maximum market leverage.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-fpo-add-member"
            onClick={() => setIsAddMemberModalOpen(true)}
            className="px-3.5 py-2 bg-teal-700 hover:bg-teal-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" />
            <span>Add Member</span>
          </button>
          <button
            id="btn-fpo-bulk-list"
            onClick={() => setIsBulkListingModalOpen(true)}
            className="px-4 py-2 bg-white text-teal-950 hover:bg-teal-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-teal-700" />
            <span>Create Bulk Listing</span>
          </button>
        </div>
      </div>

      {listingSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{listingSuccessMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Active Member Farmers</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalMemberFarmers}</div>
          <div className="text-[11px] text-teal-700 mt-0.5">Across 4 Prakasam mandals</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Aggregated Volume</div>
          <div className="text-2xl font-extrabold text-teal-700 mt-1">{totalAggregatedVolumeKg.toLocaleString()} <span className="text-sm font-semibold text-slate-500">kg</span></div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ready for procurement</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">Open Buyer Demands</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{buyerReqs.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Bulk buyer inquiries</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-semibold">FPO Revenue Stream</div>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">₹1,42,000</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Direct member payouts</div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 space-x-2 sm:space-x-4 overflow-x-auto">
        {[
          { id: 'aggregation', label: 'Produce Aggregation Showcase' },
          { id: 'forecast', label: 'AI Price & Demand Forecast ✨' },
          { id: 'members', label: `Member Farmers (${members.length})` },
          { id: 'buyers', label: `Buyer Matching (${buyerReqs.length})` },
          { id: 'analytics', label: 'Aggregation Analytics' }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`tab-fpo-${tab.id}`}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Aggregation Showcase (Highlighting the 5,000 kg prompt example) */}
      {activeTab === 'aggregation' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md">
                  CORE AGGREGATION ENGINE
                </span>
                <h2 className="text-lg font-bold text-slate-900 mt-1.5">
                  Aggregated Farm Produce Batches
                </h2>
                <p className="text-xs text-slate-500">
                  Combines smallholder yields into full truckload volumes (FTL) for corporate buyers
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {aggregations.map((agg) => (
                <div
                  key={agg.crop}
                  className="border-2 border-teal-100 bg-teal-50/30 rounded-2xl p-5 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-teal-200/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-extrabold text-slate-900">{agg.crop}</h3>
                        <span className="bg-teal-100 text-teal-900 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          {agg.memberCount} Farmers Combined
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Standard Benchmark Asking Price: <strong className="text-teal-900">₹{agg.askingPricePerKg}/kg</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">Aggregated Total</div>
                      <div className="text-2xl font-black text-teal-800">
                        {agg.totalQuantityKg.toLocaleString()} kg
                      </div>
                    </div>
                  </div>

                  {/* Member contribution breakdown table */}
                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                      Individual Farmer Yield Breakdown:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {agg.members.map((m, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-teal-200/70 rounded-xl p-3 shadow-2xs"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-900">{m?.name || 'Member'}</span>
                            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                              {m?.grade || 'A'}
                            </span>
                          </div>
                          <div className="mt-2 flex items-baseline justify-between">
                            <span className="text-xs text-slate-500">{m?.village || 'Ongole'}</span>
                            <span className="text-base font-extrabold text-teal-700">{(m?.quantityKg || 0).toLocaleString()} kg</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Calculation formula display */}
                    <div className="mt-4 p-3 bg-white/80 border border-teal-200 rounded-xl flex items-center justify-between text-xs font-mono text-slate-800">
                      <span>
                        Aggregation Formula: {agg.members.map(m => `${m?.name || 'Farmer'}: ${m?.quantityKg || 0} kg`).join(' + ')}
                      </span>
                      <span className="font-extrabold text-teal-900 text-sm">
                        = {agg.totalQuantityKg.toLocaleString()} kg
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Members Management */}
      {activeTab === 'members' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Registered FPO Member Farmers</h2>
              <p className="text-xs text-slate-500">Farmers pooling harvests under this producer company</p>
            </div>
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Farmer Name</th>
                  <th className="py-2.5 px-3">Village / Mandal</th>
                  <th className="py-2.5 px-3">Primary Crop</th>
                  <th className="py-2.5 px-3">Quantity</th>
                  <th className="py-2.5 px-3">Quality Grade</th>
                  <th className="py-2.5 px-3">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{m.farmerName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{m.village}</td>
                    <td className="py-2.5 px-3 font-semibold text-teal-800">{m.crop}</td>
                    <td className="py-2.5 px-3 font-extrabold text-slate-900">{m.quantityKg.toLocaleString()} kg</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {m.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{m.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Buyer Matching */}
      {activeTab === 'buyers' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Open Bulk Buyer Demands</h2>
          <p className="text-xs text-slate-500 mb-4">Industrial buyers matching your FPO's aggregated crop supplies</p>

          <div className="space-y-4">
            {buyerReqs.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-teal-900 bg-teal-100 px-2.5 py-0.5 rounded-full">
                      Requirement #{req.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{req.buyerName}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Seeking {req.quantity.toLocaleString()} {req.unit} of {req.product} ({req.qualityGrade})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Max Price: <strong>₹{req.maxPricePerUnit}/kg</strong> • Delivery: <strong>{req.deliveryLocation}</strong>
                  </p>
                  {req.specialRequirements && (
                    <p className="text-[11px] text-slate-600 mt-1 italic">
                      Note: "{req.specialRequirements}"
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 self-end md:self-auto">
                  <button
                    onClick={() => {
                      alert(`Inquiry dispatched to ${req.buyerName} for ${req.quantity} kg ${req.product}. Direct FPO contract established.`);
                    }}
                    className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    Match & Contract Lot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: AI Price Recommendation & Demand Forecasting */}
      {activeTab === 'forecast' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-800 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>AI APMC Market Intelligence Engine</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  AI Price Recommendation & Demand Forecasting
                </h2>
                <p className="text-xs text-slate-500">
                  Predictive price bands and market trend forecasts calibrated for Andhra Pradesh FPOs and institutional wholesale buyers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchForecast(selectedCropForecast)}
                  disabled={isAiLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  title="Refresh AI prediction models"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isAiLoading ? 'animate-spin' : ''}`} />
                  <span>{isAiLoading ? 'Analyzing...' : 'Refresh AI Analysis'}</span>
                </button>
              </div>
            </div>

            {/* Crop Selector Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Crop for AI Market Analysis:
              </label>
              <div className="flex flex-wrap gap-2">
                {['Tomato', 'Chilli', 'Cotton', 'Onion', 'Bengal Gram', 'Mango', 'Potato', 'Rice'].map((crop) => (
                  <button
                    key={crop}
                    onClick={() => setSelectedCropForecast(crop)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCropForecast === crop
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Insights Display */}
            {demandForecast ? (
              <div className="space-y-5">
                {/* 3 Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-2xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                      Recommended Bulk Price Band
                    </span>
                    <div className="text-2xl font-black text-teal-900 mt-1">
                      ₹{demandForecast.suggestedPriceRange?.min || 26} – ₹{demandForecast.suggestedPriceRange?.max || 32}
                      <span className="text-xs font-semibold text-slate-600"> / kg</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      ≈ ₹{((demandForecast.suggestedPriceRange?.min || 26) * 100).toLocaleString()} – ₹{((demandForecast.suggestedPriceRange?.max || 32) * 100).toLocaleString()} / quintal
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                      Market Demand Trajectory
                    </span>
                    <div className="text-2xl font-black text-blue-900 mt-1">
                      {demandForecast.predictedDemandChange || '+18% Next 14 Days'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5">
                      <span>Status:</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                        {demandForecast.demandLevel || 'HIGH DEMAND'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      Prediction Reliability
                    </span>
                    <div className="text-2xl font-black text-emerald-800 mt-1">
                      {demandForecast.confidenceScore || 94}%
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      Aggregated from Prakasam & Guntur Mandis
                    </div>
                  </div>
                </div>

                {/* AI Actionable Strategy Quote */}
                <div className="p-4 bg-gradient-to-r from-teal-900 to-slate-900 rounded-2xl text-white shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>AI Strategic Recommendation for FPO:</span>
                  </div>
                  <p className="text-sm sm:text-base font-medium text-teal-50 italic leading-relaxed">
                    "{demandForecast.recommendation || `Strong institutional buyer demand in nearby Tier-1 processing centers. FPO recommended to aggregate minimum 5,000 kg and offer FTL (Full Truckload) contracts at ₹${demandForecast.suggestedPriceRange?.min || 26}–₹${demandForecast.suggestedPriceRange?.max || 32}/kg.`}"
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-300">Suggested Action:</span>
                    <button
                      onClick={() => {
                        setBulkCrop(selectedCropForecast);
                        if (demandForecast.suggestedPriceRange?.min) {
                          setBulkPrice(String(demandForecast.suggestedPriceRange.min));
                        }
                        setIsBulkListingModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Publish Bulk Listing at AI Price (₹{demandForecast.suggestedPriceRange?.min || 27}/kg)</span>
                    </button>
                  </div>
                </div>

                {/* Market Trends Chart */}
                {demandForecast.historicalTrends && demandForecast.historicalTrends.length > 0 && (
                  <div className="pt-2">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Projected Price & Volume Index (Next 4 Weeks)
                    </h3>
                    <div className="h-56 w-full bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={demandForecast.historicalTrends}>
                          <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} />
                          <Tooltip
                            formatter={(val: any) => [`₹${val}/kg`, 'Modal Benchmark Price']}
                            contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                          />
                          <Bar dataKey="avgPrice" fill="#0d9488" radius={[4, 4, 0, 0]} name="Predicted Price (₹/kg)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                {isAiLoading ? 'Loading AI forecast model...' : 'Select a crop to view AI price recommendations and demand forecasting.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Analytics */}
      {activeTab === 'analytics' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">FPO Aggregation Analytics</h2>
              <p className="text-xs text-slate-500">Produce pooling volume distribution across crops</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="crop" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  formatter={(val: any) => [`${val} kg`, 'Total Aggregated']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="volumeKg" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 5: AI Price Recommendation & Demand Forecasting */}
      {activeTab === 'forecast' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-teal-100 text-teal-800 rounded-lg">
                    <Sparkles className="w-5 h-5 text-teal-700" />
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    FPO AI Price Intelligence & Demand Forecasting
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Institutional APMC trend analytics, wholesale terminal forecasts & bulk pricing recommendations
                </p>
              </div>

              {/* Crop selector */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['Tomato', 'Onion', 'Chilli', 'Rice', 'Potato'].map((crop) => (
                  <button
                    key={crop}
                    onClick={() => setSelectedCropForecast(crop)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCropForecast === crop
                        ? 'bg-teal-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {/* Forecast Body */}
            {demandForecast ? (
              <div className="mt-6 space-y-6">
                {/* 3 Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                      Current Regional Demand
                    </span>
                    <div className="text-2xl font-extrabold text-teal-950 mt-1">
                      {demandForecast.currentDemand}
                    </div>
                    <span className="text-[11px] text-teal-700 font-medium">South India / APMC Yards</span>
                  </div>

                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      7-Day Projected Change
                    </span>
                    <div className="text-2xl font-extrabold text-emerald-700 mt-1">
                      {demandForecast.predictedDemandChange}
                    </div>
                    <span className="text-[11px] text-emerald-700 font-medium">Wholesale buying volume trend</span>
                  </div>

                  <div className="p-4 bg-sky-50/60 border border-sky-200 rounded-2xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">
                      Confidence Level
                    </span>
                    <div className="text-2xl font-extrabold text-sky-900 mt-1">
                      {demandForecast.confidenceScore}%
                    </div>
                    <span className="text-[11px] text-sky-700 font-medium">
                      {demandForecast.isAiGenerated ? 'Gemini AI Grounded' : 'APMC Agro Model'}
                    </span>
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="p-5 bg-gradient-to-r from-teal-900 to-emerald-950 text-white rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-teal-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Actionable FPO Aggregation Guidance ({selectedCropForecast})
                    </span>
                    <button
                      onClick={() => fetchForecast(selectedCropForecast)}
                      disabled={isAiLoading}
                      className="text-xs text-teal-200 hover:text-white flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
                      <span>{isAiLoading ? 'Analyzing...' : 'Re-run AI Analysis'}</span>
                    </button>
                  </div>
                  <p className="text-sm font-medium leading-relaxed text-teal-50">
                    "{demandForecast.recommendation}"
                  </p>
                </div>

                {/* Suggested Optimal Price Range */}
                {demandForecast.suggestedPriceRange && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-amber-900 uppercase">
                        FPO Optimal Asking Price Range for Bulk Lots
                      </span>
                      <div className="text-2xl font-black text-amber-950 mt-0.5">
                        ₹{demandForecast.suggestedPriceRange.min} – ₹{demandForecast.suggestedPriceRange.max} / {demandForecast.suggestedPriceRange.unit}
                      </div>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Suggested rate for aggregated institutional truckloads (Grade A quality)
                      </p>
                    </div>

                    <button
                      id="btn-apply-fpo-ai-price"
                      onClick={() => {
                        setBulkCrop(selectedCropForecast);
                        setBulkPrice(String(demandForecast.suggestedPriceRange.min));
                        setIsBulkListingModalOpen(true);
                      }}
                      className="px-4 py-2.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Apply & Create Bulk Listing</span>
                    </button>
                  </div>
                )}

                {/* Market Insights List */}
                {demandForecast.marketInsights && demandForecast.marketInsights.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                      Ground Market Intelligence & Trade Signals
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {demandForecast.marketInsights.map((insight, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Loading AI Demand and Price Intelligence...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Member Farmer */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAddMemberModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Add Member Farmer</h3>
            <p className="text-xs text-slate-500 mb-4">Add farmer and their harvest to this FPO lot.</p>

            <form onSubmit={handleAddMember} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Farmer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farmer D (Narayana)"
                  value={newMember.farmerName}
                  onChange={(e) => setNewMember({ ...newMember, farmerName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Village</label>
                  <input
                    type="text"
                    required
                    value={newMember.village}
                    onChange={(e) => setNewMember({ ...newMember, village: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98481..."
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Crop</label>
                  <select
                    value={newMember.crop}
                    onChange={(e) => setNewMember({ ...newMember, crop: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Potato">Potato</option>
                    <option value="Onion">Onion</option>
                    <option value="Chilli">Chilli</option>
                    <option value="Rice">Rice</option>
                    <option value="Maize">Maize</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={newMember.quantityKg}
                    onChange={(e) => setNewMember({ ...newMember, quantityKg: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold"
                >
                  Add to Aggregation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Bulk Listing */}
      {isBulkListingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsBulkListingModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Bulk Market Listing</h3>
            <p className="text-xs text-slate-500 mb-4">
              Publish entire aggregated lot to the marketplace for institutional buyers.
            </p>

            <form onSubmit={handlePublishBulkListing} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Aggregated Crop</label>
                <select
                  value={bulkCrop}
                  onChange={(e) => setBulkCrop(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {aggregations.map(a => (
                    <option key={a.crop} value={a.crop}>
                      {a.crop} ({a.totalQuantityKg.toLocaleString()} kg available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Asking Price (₹/kg)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs">
                This listing will represent the pooled crop of all member farmers, backed by the FPO quality guarantee.
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBulkListingModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold"
                >
                  Publish Bulk Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
