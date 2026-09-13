import React, { useState, useEffect } from 'react';
import {
  Factory,
  PlusCircle,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sprout,
  X,
  Package,
  Layers,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';
import { BuyerRequirement, Order } from '../../types';
import { ProcureLotModal } from '../common/ProcureLotModal';

interface BulkBuyerDashboardProps {
  onBack?: () => void;
}

export const BulkBuyerDashboard: React.FC<BulkBuyerDashboardProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<string | null>('req-1');
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contractSuccessMsg, setContractSuccessMsg] = useState<string | null>(null);

  // Procure Lot Modal State
  const [isProcureModalOpen, setIsProcureModalOpen] = useState(false);
  const [selectedLotForProcure, setSelectedLotForProcure] = useState<any | null>(null);
  const [lastProcuredOrder, setLastProcuredOrder] = useState<Order | null>(null);

  // New requirement form state
  const [newReq, setNewReq] = useState({
    product: 'Tomato',
    quantity: '5000',
    unit: 'kg',
    qualityGrade: 'Grade A',
    maxPricePerUnit: '30',
    requiredDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    deliveryLocation: 'Hyderabad Processing Hub',
    deadline: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    specialRequirements: 'Uniform ripeness, firm skin, low moisture content'
  });

  const fetchRequirements = async () => {
    try {
      const data = await api.getBuyerRequirements();
      setRequirements(data);
      if (data.length > 0 && !selectedReqId) {
        setSelectedReqId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load requirements:', err);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  useEffect(() => {
    if (!selectedReqId) return;
    const fetchMatches = async () => {
      setIsLoadingMatches(true);
      try {
        const matchData = await api.getRequirementMatches(selectedReqId);
        setMatches(matchData);
      } catch (err) {
        console.error('Failed to fetch matches:', err);
      } finally {
        setIsLoadingMatches(false);
      }
    };
    fetchMatches();
  }, [selectedReqId]);

  const handleCreateRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = await api.addBuyerRequirement({
        buyerId: currentUser?.id || 'bulk-1',
        buyerName: currentUser?.name || 'Ananya Foods & Agro Processing',
        buyerPhone: currentUser?.phone || '+91 98480 45678',
        product: newReq.product,
        quantity: Number(newReq.quantity),
        unit: newReq.unit,
        qualityGrade: newReq.qualityGrade,
        maxPricePerUnit: Number(newReq.maxPricePerUnit),
        requiredDate: newReq.requiredDate,
        deliveryLocation: newReq.deliveryLocation,
        deadline: newReq.deadline,
        specialRequirements: newReq.specialRequirements
      });

      setIsModalOpen(false);
      fetchRequirements();
      setSelectedReqId(saved.id);
    } catch (err) {
      console.error('Failed to create requirement:', err);
    }
  };

  const handleEstablishContract = (supplier: any) => {
    setSelectedLotForProcure({
      ...supplier,
      requirementId: selectedReqId,
      availableQuantity: supplier.quantityAvailable,
      pricePerUnit: supplier.pricePerUnit,
      crop: supplier.crop || activeRequirement?.product || 'Produce',
      supplierId: supplier.supplierId,
      supplierName: supplier.supplierName,
      type: supplier.supplierType
    });
    setIsProcureModalOpen(true);
  };

  const activeRequirement = requirements.find(r => r.id === selectedReqId);

  const totalDemandTonnage = requirements.reduce((sum, r) => sum + r.quantity, 0);
  const matchedRequirementsCount = requirements.filter(r => r.status === 'MATCHED').length;
  const highScoringMatchesCount = matches.filter(m => m.matchScore >= 80).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Status & Credential Bar */}
      <div className="flex items-center justify-end gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg border border-amber-200 font-semibold">
          <Factory className="w-3.5 h-3.5 text-amber-700" />
          <span>Verified Institutional Procurer</span>
        </span>
        <span className="hidden sm:inline text-slate-400">•</span>
        <span className="hidden sm:inline text-slate-600 font-medium">
          Buyer ID: <span className="font-mono text-slate-800 font-bold">{currentUser?.id || 'BUYER-501'}</span>
        </span>
      </div>

      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-800 to-orange-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-amber-700/60 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Factory className="w-4 h-4 text-amber-300" />
            <span>Institutional & Bulk Procurement Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {currentUser?.name || 'Ananya Foods & Agro Processing'}
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 mt-1">
            Specify bulk tonnage requirements and match aggregated FPO lots and farmer yields algorithmically.
          </p>
        </div>

        <button
          id="btn-bulk-create-requirement"
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-white text-amber-950 hover:bg-amber-50 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-amber-700" />
          <span>Create Requirement</span>
        </button>
      </div>

      {/* Bulk Dashboard Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">Total Demand</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalDemandTonnage.toLocaleString()} <span className="text-xs text-slate-500 font-normal">kg</span></div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Institutional requirement</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">Active Requests</span>
            <Layers className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{requirements.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">{matchedRequirementsCount} matched lots</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">Prime Matches</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{highScoringMatchesCount}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Score ≥ 80% compatibility</div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1.5">
            <span className="text-xs font-semibold">FPO Direct Sourcing</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-teal-700">100%</div>
          <div className="text-[11px] text-slate-500 mt-1">Zero mandi commission markup</div>
        </div>
      </div>

      {contractSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{contractSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Left requirements list, Right supplier matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Requirements list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Procurement Demands</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
              {requirements.length} Active
            </span>
          </div>

          <div className="space-y-3">
            {requirements.map((req) => (
              <div
                key={req.id}
                id={`bulk-req-${req.id}`}
                onClick={() => setSelectedReqId(req.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer shadow-xs ${
                  selectedReqId === req.id
                    ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {req.qualityGrade}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1">
                      {req.product} — {req.quantity.toLocaleString()} {req.unit}
                    </h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    req.status === 'MATCHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {req.status}
                  </span>
                </div>

                <div className="mt-3 text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Target Max Price:</span>
                    <span className="font-bold text-slate-900">₹{req.maxPricePerUnit}/kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Required Date:</span>
                    <span>{req.requiredDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Destination:</span>
                    <span className="truncate max-w-[140px]">{req.deliveryLocation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Supplier Matching Engine & Transparent Scoring */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Active requirement banner */}
          {activeRequirement && (
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    Active Procurement Target
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Matching Suppliers for {activeRequirement.quantity.toLocaleString()} {activeRequirement.unit} of {activeRequirement.product} ({activeRequirement.qualityGrade})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Delivery to: {activeRequirement.deliveryLocation} • Ceiling Price: ₹{activeRequirement.maxPricePerUnit}/kg
                  </p>
                </div>
              </div>

              {/* Match Scoring Formula Transparency */}
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1">
                  Transparent Match Scoring Weights:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Product</span>
                    <strong className="text-slate-900">30%</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Quantity</span>
                    <strong className="text-slate-900">25%</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Price</span>
                    <strong className="text-slate-900">20%</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Quality</span>
                    <strong className="text-slate-900">15%</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Distance</span>
                    <strong className="text-slate-900">10%</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Matches List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Ranked Suitable Suppliers & Aggregated Lots ({matches.length})</span>
            </h3>

            {isLoadingMatches ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                Running heuristic matching engine...
              </div>
            ) : matches.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                No matching farm or FPO suppliers found for this requirement currently.
              </div>
            ) : (
              matches.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border-2 border-slate-200 hover:border-amber-400 rounded-2xl p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        item.supplierType === 'FPO' ? 'bg-teal-100 text-teal-900' : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {item.supplierType === 'FPO' ? <Building2 className="w-3 h-3" /> : <Sprout className="w-3 h-3" />}
                        {item.supplierType} Aggregated Pool
                      </span>
                      <span className="text-xs font-bold text-slate-900">{item.supplierName}</span>
                    </div>

                    <div className="text-base font-extrabold text-slate-900">
                      Available: {item.quantityAvailable.toLocaleString()} {item.unit} @ ₹{item.pricePerUnit}/kg
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600 pt-1">
                      <div>Quality: <strong className="text-slate-800">{item.quality}</strong></div>
                      <div>Distance: <strong className="text-slate-800">{item.distanceKm} km</strong></div>
                      <div>Logistics Est: <strong className="text-slate-800">₹{item.estimatedLogisticsCost}</strong></div>
                      {item.memberCount && (
                        <div>FPO Farmers: <strong className="text-teal-800">{item.memberCount} pooled</strong></div>
                      )}
                    </div>

                    {/* Breakdown pill tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-slate-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded">Product: {item.scoreBreakdown.productCompatibility}/30</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded">Qty: {item.scoreBreakdown.quantity}/25</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded">Price: {item.scoreBreakdown.price}/20</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded">Quality: {item.scoreBreakdown.quality}/15</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded">Distance: {item.scoreBreakdown.distance}/10</span>
                    </div>
                  </div>

                  {/* Match Score & Action */}
                  <div className="flex md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Match Score</div>
                      <div className="text-2xl font-black text-amber-600">{item.matchScore}%</div>
                    </div>

                    <button
                      onClick={() => handleEstablishContract(item)}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      Procure Lot
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

      {/* Modal: Create Requirement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Create Bulk Procurement Requirement</h3>
            <p className="text-xs text-slate-500 mb-4">
              Post your demand parameters to trigger AI supplier matching across farmers and FPOs.
            </p>

            <form onSubmit={handleCreateRequirement} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Product</label>
                  <select
                    value={newReq.product}
                    onChange={(e) => setNewReq({ ...newReq, product: e.target.value })}
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
                  <label className="block font-bold text-slate-700 mb-1">Quality / Grade</label>
                  <select
                    value={newReq.qualityGrade}
                    onChange={(e) => setNewReq({ ...newReq, qualityGrade: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Grade A">Grade A (Export / Retail Quality)</option>
                    <option value="Grade B">Grade B (Standard Commercial)</option>
                    <option value="Grade C">Grade C (Industrial Puree/Processing)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Required Quantity</label>
                  <input
                    type="number"
                    min="500"
                    required
                    value={newReq.quantity}
                    onChange={(e) => setNewReq({ ...newReq, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit</label>
                  <select
                    value={newReq.unit}
                    onChange={(e) => setNewReq({ ...newReq, unit: e.target.value })}
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
                  <label className="block font-bold text-slate-700 mb-1">Maximum Price (₹/unit)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newReq.maxPricePerUnit}
                    onChange={(e) => setNewReq({ ...newReq, maxPricePerUnit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Required By Date</label>
                  <input
                    type="date"
                    required
                    value={newReq.requiredDate}
                    onChange={(e) => setNewReq({ ...newReq, requiredDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Delivery Destination</label>
                <input
                  type="text"
                  required
                  value={newReq.deliveryLocation}
                  onChange={(e) => setNewReq({ ...newReq, deliveryLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="e.g. Hyderabad Food Park Hub"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Special Specifications / Processing Notes</label>
                <textarea
                  rows={2}
                  value={newReq.specialRequirements}
                  onChange={(e) => setNewReq({ ...newReq, specialRequirements: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="e.g. Uniform ripeness, firm skin, suitable for paste/puree"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Publish & Find Suppliers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Procure Lot Agreement */}
      <ProcureLotModal
        isOpen={isProcureModalOpen}
        onClose={() => setIsProcureModalOpen(false)}
        lot={selectedLotForProcure}
        requirementId={selectedReqId || undefined}
        onSuccess={(order, message) => {
          setContractSuccessMsg(message);
          setLastProcuredOrder(order);
          fetchRequirements();
          setTimeout(() => setContractSuccessMsg(null), 8000);
        }}
      />

    </div>
  );
};
