import React, { useState } from 'react';
import {
  X,
  Package,
  Building,
  Truck,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Calendar,
  MapPin,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Order } from '../../types';

interface ProcureLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: any;
  requirementId?: string;
  onSuccess: (order: Order, message: string) => void;
}

export const ProcureLotModal: React.FC<ProcureLotModalProps> = ({
  isOpen,
  onClose,
  lot,
  requirementId,
  onSuccess
}) => {
  const { currentUser } = useAuth();

  const [quantity, setQuantity] = useState<number>(lot?.availableQuantity || 2000);
  const [deliveryLocation, setDeliveryLocation] = useState(
    currentUser?.address || 'Industrial Estate, Cherlapally, Hyderabad'
  );
  const [paymentTerms, setPaymentTerms] = useState('Escrow Bank Guarantee');
  const [specialNote, setSpecialNote] = useState('Grade A batch required with moisture content under 12%.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !lot) return null;

  const pricePerUnit = lot.pricePerUnit || 27;
  const productAmount = quantity * pricePerUnit;
  const logisticsCharge = Math.round(500 + (quantity / 1000) * 450);
  const totalAmount = productAmount + logisticsCharge;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError('Please enter a valid procurement volume.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.procureBulkLot({
        buyerId: currentUser?.id || 'bulk-1',
        buyerName: currentUser?.name || 'Ananya Foods & Agro Processing',
        buyerPhone: currentUser?.phone || '+91 98480 45678',
        requirementId: requirementId || lot.requirementId,
        supplierId: lot.supplierId || 'fpo-1',
        supplierName: lot.supplierName || 'Prakasam Rythu Mitra FPO',
        supplierType: lot.type || 'FPO',
        product: lot.crop || 'Tomato',
        quantity,
        unit: 'kg',
        pricePerUnit,
        deliveryLocation,
        paymentTerms
      });

      if (res.success && res.order) {
        onSuccess(res.order, res.message);
        onClose();
      } else {
        setError(res.message || 'Failed to complete procurement contract.');
      }
    } catch (err: any) {
      console.error('Procurement error:', err);
      setError(err.message || 'An error occurred while establishing procurement contract.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Package className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Procure Bulk Agricultural Lot</h2>
            <p className="text-xs text-slate-500">Formal B2B Digital Escrow Procurement Agreement</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Supplier Lot Overview Card */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                  {lot.type || 'FPO Aggregated Lot'}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">{lot.crop} — Grade A Standard</h3>
                <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                  <Building className="w-3.5 h-3.5 text-amber-700" />
                  <span>Supplier: {lot.supplierName}</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Negotiated Price:</span>
                <div className="text-base font-black text-emerald-700">₹{pricePerUnit}/kg</div>
                <span className="text-[10px] text-slate-500">Total Lot Avail: {lot.availableQuantity} kg</span>
              </div>
            </div>
          </div>

          {/* Volume and Calculations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Procurement Volume (kg)</label>
              <div className="relative">
                <input
                  type="number"
                  min={100}
                  max={lot.availableQuantity * 2 || 10000}
                  step={50}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <span className="absolute right-3 top-2 text-slate-400 font-bold">KG</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Recommended wholesale lot size: 1000+ kg</span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment & Guarantee Terms</label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="Escrow Bank Guarantee">Escrow Guarantee (Release upon QC)</option>
                <option value="Corporate RTGS/NEFT">Direct RTGS / Bank Transfer</option>
                <option value="UPI Instant Settlement">Corporate UPI Settlement</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Funds protected in Kisaan2Karidhar Escrow</span>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Destination Processing Depot</label>
            <div className="relative">
              <input
                type="text"
                required
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                placeholder="Enter warehouse / plant delivery location"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Quality Inspection & Packaging Specs</label>
            <textarea
              rows={2}
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              placeholder="e.g., crate packaging, moisture limits, pesticide tests..."
            />
          </div>

          {/* Cost Breakdown */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-medium">
            <div className="flex justify-between text-slate-600">
              <span>Produce Value ({quantity} kg × ₹{pricePerUnit}):</span>
              <span className="font-semibold text-slate-900">₹{productAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-slate-500" />
                <span>Aggregated Freight & Transit Logistics:</span>
              </span>
              <span className="font-semibold text-slate-900">₹{logisticsCharge.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-600 text-[11px]">
              <span>Mandi Cess & Intermediary Brokerage:</span>
              <span className="font-bold text-emerald-600">₹0 (Direct Procurement Waiver)</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
              <span>Total Contract Value:</span>
              <span className="text-base text-amber-700 font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-confirm-procure-contract"
              className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-200" />
              <span>{isSubmitting ? 'Securing Lot...' : 'Execute Contract & Procure Lot'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
