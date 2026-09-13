import React, { useState } from 'react';
import { CheckCircle2, CreditCard, ShieldCheck, Smartphone, X, Loader2, ArrowLeft } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  productAmount: number;
  distanceKm: number;
  logisticsCharge: number;
  totalAmount: number;
  farmerName: string;
  onConfirmPayment: (paymentMethod: string) => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  productName,
  quantity,
  unit,
  pricePerUnit,
  productAmount,
  distanceKm,
  logisticsCharge,
  totalAmount,
  farmerName,
  onConfirmPayment
}) => {
  const [method, setMethod] = useState<'UPI' | 'Google Pay' | 'PhonePe' | 'Paytm' | 'Card'>('UPI');
  const [upiId, setUpiId] = useState('priya@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      // Simulate sandbox secure authorization
      await new Promise(r => setTimeout(r, 900));
      await onConfirmPayment(method);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-md"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Payment Successful!</h3>
            <p className="text-xs text-slate-600">
              Paid ₹{totalAmount} via {method}. Your order is confirmed and dispatched to logistics.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-lg mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Kisaan2Karidhar Secure Checkout</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Direct Farmer Settlement • Zero Hidden Broker Fees • Sandbox Mode
            </p>

            {/* Bill Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-xs">
              <div className="flex justify-between items-center pb-2 text-slate-700">
                <span>Product Amount ({quantity} {unit} × ₹{pricePerUnit}/kg)</span>
                <span className="font-semibold text-slate-900">₹{productAmount}</span>
              </div>
              <div className="flex justify-between items-center py-2 text-slate-700 border-t border-slate-200">
                <span className="flex items-center gap-1">
                  Logistics/Delivery Charge ({distanceKm} km)
                </span>
                <span className="font-semibold text-slate-900">₹{logisticsCharge}</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-sm font-extrabold text-emerald-950 border-t-2 border-slate-300">
                <span>Total Amount</span>
                <span className="text-base text-emerald-700">₹{totalAmount}</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Direct to farmer: <strong>{farmerName}</strong>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-2">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI', label: 'UPI QR', icon: <Smartphone className="w-4 h-4" /> },
                  { id: 'Google Pay', label: 'Google Pay', icon: <span>GPay</span> },
                  { id: 'PhonePe', label: 'PhonePe', icon: <span>PhonePe</span> },
                  { id: 'Paytm', label: 'Paytm', icon: <span>Paytm</span> },
                  { id: 'Card', label: 'Debit/Card', icon: <CreditCard className="w-4 h-4" /> }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors ${
                      method === item.id
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    {item.icon}
                    <span className="text-[11px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Method Input Details */}
            {method !== 'Card' ? (
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-600 mb-1">VPA / Virtual Payment Address</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  placeholder="name@upi"
                />
              </div>
            ) : (
              <div className="mb-4 space-y-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Card Number (Sandbox)</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            <div className="text-[11px] text-slate-400 mb-4 bg-slate-100 p-2 rounded-lg">
              🛡️ Sandbox Mode: Authentic transaction record will be created. No actual bank money is debited.
            </div>

            <div className="flex items-center gap-3">
              <button
                id="btn-payment-back"
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                title="Return to selection without charging"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                id="btn-confirm-payment"
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authorizing ₹{totalAmount}...</span>
                  </>
                ) : (
                  <span>Pay ₹{totalAmount} via {method}</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
