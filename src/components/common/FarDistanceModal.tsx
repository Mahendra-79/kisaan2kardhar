import React from 'react';
import { AlertTriangle, MapPin, Truck, ArrowRight, ArrowLeft } from 'lucide-react';

interface FarDistanceModalProps {
  isOpen: boolean;
  distanceKm: number;
  deliveryCharge: number;
  farmerName: string;
  onContinue: () => void;
  onGoBack: () => void;
}

export const FarDistanceModal: React.FC<FarDistanceModalProps> = ({
  isOpen,
  distanceKm,
  deliveryCharge,
  farmerName,
  onContinue,
  onGoBack
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-amber-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-center text-slate-900">
          Far Distance Notice
        </h3>

        <div className="mt-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-sm font-medium text-center">
          ⚠️ This farmer is far from your delivery location. Additional delivery charges may apply.
        </div>

        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 divide-y divide-slate-200">
          <div className="flex items-center justify-between pb-2 text-xs">
            <span className="text-slate-500">Selected Farmer:</span>
            <span className="font-semibold text-slate-800">{farmerName}</span>
          </div>
          <div className="flex items-center justify-between py-2 text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600" /> Distance:
            </span>
            <span className="font-bold text-slate-900 text-sm">{distanceKm} km</span>
          </div>
          <div className="flex items-center justify-between pt-2 text-xs">
            <span className="text-slate-500 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-blue-600" /> Estimated delivery charge:
            </span>
            <span className="font-extrabold text-emerald-700 text-base">₹{deliveryCharge}</span>
          </div>
        </div>

        <p className="mt-3 text-[11px] text-slate-500 text-center">
          Our logistics network will dispatch a dedicated transport vehicle for your order.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            id="btn-far-warning-goback"
            type="button"
            onClick={onGoBack}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <button
            id="btn-far-warning-continue"
            type="button"
            onClick={onContinue}
            className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs transition-colors"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
