import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Truck, CheckCircle2, AlertCircle, Compass, Layers } from 'lucide-react';

interface RouteStop {
  step: number;
  type: 'PICKUP' | 'TRANSIT' | 'DELIVERY';
  label: string;
  time: string;
}

interface RouteMapProps {
  orderId?: string;
  productName?: string;
  quantity?: number;
  unit?: string;
  source?: {
    name?: string;
    pickupLocation?: string;
    address?: string;
    phone?: string;
  };
  destination?: {
    name?: string;
    deliveryLocation?: string;
    address?: string;
    phone?: string;
  };
  distanceKm?: number;
  estimatedMinutes?: number;
  stopsSequence?: RouteStop[];
  stops?: any[];
  totalDistanceKm?: number;
  estimatedDuration?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  orderId = 'K2K-ROUTE',
  productName = 'Farm Produce',
  quantity = 1,
  unit = 'kg',
  source,
  destination,
  distanceKm = 5.4,
  estimatedMinutes = 25,
  stopsSequence,
  stops,
  totalDistanceKm,
  estimatedDuration
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'sequence'>('map');
  const [mapStyle, setMapStyle] = useState<'roads' | 'satellite'>('roads');

  const safeSource = {
    name: source?.name || 'Farmer Ramesh Farmgate',
    pickupLocation: source?.pickupLocation || 'Santhanuthalapadu Depot',
    address: source?.address || 'Plot 14, Agri Corridor, Ongole',
    phone: source?.phone || '+91 98480 12345'
  };

  const safeDestination = {
    name: destination?.name || 'Customer Residence',
    deliveryLocation: destination?.deliveryLocation || 'Doorstep Delivery',
    address: destination?.address || 'Trunk Road, Ongole Central',
    phone: destination?.phone || '+91 98480 67890'
  };

  const effectiveDistance = totalDistanceKm ?? distanceKm ?? 5.4;
  const effectiveMinutes = estimatedMinutes ?? 25;

  const defaultStops: RouteStop[] = stopsSequence || [
    {
      step: 1,
      type: 'PICKUP',
      label: `Farmer Pickup: ${safeSource.name} at ${safeSource.pickupLocation}`,
      time: '0 min'
    },
    {
      step: 2,
      type: 'TRANSIT',
      label: 'Via NH16 Bypass Express Corridor - Low Congestion Route',
      time: `${Math.round(effectiveMinutes * 0.45)} min`
    },
    {
      step: 3,
      type: 'DELIVERY',
      label: `Final Dropoff: ${safeDestination.name} at ${safeDestination.deliveryLocation}`,
      time: `${effectiveMinutes} min`
    }
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Top Route Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>AI Route Engine & Optimization — Logistics Fleet</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <span>Order #{orderId}: {productName} ({quantity} {unit})</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Optimized transit path between farm gate and customer doorstep
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 flex items-center space-x-2.5">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">Distance</div>
              <div className="text-sm font-extrabold text-white">{distanceKm} km</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 flex items-center space-x-2.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-300 font-semibold">Est. Time</div>
              <div className="text-sm font-extrabold text-white">{estimatedMinutes} mins</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Bar */}
      <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'map'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interactive Route Map
          </button>
          <button
            onClick={() => setActiveTab('sequence')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'sequence'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stop Sequence & Turn-by-Turn ({defaultStops.length})
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <button
            onClick={() => setMapStyle(mapStyle === 'roads' ? 'satellite' : 'roads')}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-[11px] font-medium"
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>{mapStyle === 'roads' ? 'Road Network' : 'Satellite View'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'map' ? (
        <div className="relative w-full h-[360px] sm:h-[420px] bg-slate-900 overflow-hidden select-none">
          {/* SVG Map Canvas */}
          <svg className="w-full h-full" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
            <defs>
              {/* Grid pattern */}
              <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
              </pattern>

              {/* Linear gradient for route line */}
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background */}
            <rect width="100%" height="100%" fill={mapStyle === 'roads' ? '#0f172a' : '#09131f'} />
            <rect width="100%" height="100%" fill="url(#mapGrid)" opacity="0.6" />

            {/* Road networks simulation */}
            <g stroke="#334155" strokeWidth="3" opacity="0.5" fill="none">
              <path d="M 50 120 Q 300 150 750 90" />
              <path d="M 120 400 Q 350 280 700 380" />
              <path d="M 380 30 L 410 420" strokeWidth="4" stroke="#475569" />
              <path d="M 200 40 L 260 410" />
              <path d="M 600 50 L 560 400" />
            </g>

            {/* Water body / Canal */}
            <path
              d="M 500 0 C 480 150, 520 280, 540 450"
              stroke="#0369a1"
              strokeWidth="14"
              fill="none"
              opacity="0.35"
            />
            <text x="515" y="240" fill="#38bdf8" fontSize="10" opacity="0.6" transform="rotate(75 515 240)">
              Gundlakamma Canal Link
            </text>

            {/* Main National Highway 16 */}
            <path
              d="M 100 420 Q 320 260 700 80"
              stroke="#64748b"
              strokeWidth="8"
              fill="none"
              opacity="0.6"
            />
            <text x="360" y="220" fill="#94a3b8" fontSize="11" fontWeight="bold" opacity="0.8">
              NH 16 Bypass (Expressway)
            </text>

            {/* The Active Optimized Route Path */}
            <path
              d="M 170 320 C 230 310, 270 230, 390 220 S 520 180, 620 140"
              stroke="#10b981"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              filter="url(#routeGlow)"
            />
            <path
              d="M 170 320 C 230 310, 270 230, 390 220 S 520 180, 620 140"
              stroke="url(#routeGradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="8 4"
              fill="none"
            />

            {/* Source Marker: Farmer Pickup Point (Ongole South) */}
            <g transform="translate(170, 320)">
              {/* Outer pulse */}
              <circle r="22" fill="#10b981" opacity="0.2">
                <animate attributeName="r" values="14;28;14" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Pin base */}
              <circle r="14" fill="#059669" stroke="#ffffff" strokeWidth="2.5" />
              <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">A</text>
              
              {/* Label card */}
              <g transform="translate(-80, 24)">
                <rect width="160" height="42" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                <text x="80" y="16" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">
                  START / SOURCE
                </text>
                <text x="80" y="32" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="600">
                  {safeSource.pickupLocation.length > 20 ? safeSource.pickupLocation.substring(0, 18) + '...' : safeSource.pickupLocation}
                </text>
              </g>
            </g>

            {/* Destination Marker: Customer Delivery Point (Ongole Central) */}
            <g transform="translate(620, 140)">
              {/* Outer pulse */}
              <circle r="22" fill="#3b82f6" opacity="0.2">
                <animate attributeName="r" values="14;28;14" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
              {/* Pin base */}
              <circle r="14" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" />
              <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">B</text>

              {/* Label card */}
              <g transform="translate(-80, -56)">
                <rect width="160" height="42" rx="6" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
                <text x="80" y="16" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="bold">
                  DESTINATION (Customer)
                </text>
                <text x="80" y="32" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="600">
                  {safeDestination.deliveryLocation.length > 20 ? safeDestination.deliveryLocation.substring(0, 18) + '...' : safeDestination.deliveryLocation}
                </text>
              </g>
            </g>

            {/* Moving Vehicle Indicator along path */}
            <g transform="translate(390, 220)">
              <circle r="12" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
              <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">🚚</text>
              <g transform="translate(18, -12)">
                <rect width="110" height="24" rx="4" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
                <text x="55" y="15" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="bold">
                  En Route (12 km/h)
                </text>
              </g>
            </g>
          </svg>

          {/* Quick HUD overlay in bottom corner */}
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-slate-300">Live GPS Heuristic:</span>
              <span className="text-emerald-400 font-semibold">{effectiveDistance} km direct corridor</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Start: {safeSource.name}
              </span>
              <span>→</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Drop: {safeDestination.name}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Sequence View */
        <div className="p-5">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Optimized Sequence of Waypoints & Stops</span>
          </h3>
          <div className="space-y-3">
            {defaultStops.map((stop, idx) => (
              <div
                key={stop.step}
                className="flex items-start space-x-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 transition-colors"
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                  stop.type === 'PICKUP' ? 'bg-emerald-600' : stop.type === 'DELIVERY' ? 'bg-blue-600' : 'bg-slate-600'
                }`}>
                  {stop.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {stop.type}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      +{stop.time}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-800 mt-1">{stop.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Address Details Card */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-white border border-emerald-200 rounded-xl">
          <div className="font-bold text-emerald-800 uppercase tracking-wide flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>START / SOURCE (Farmer Pickup)</span>
          </div>
          <p className="font-semibold text-slate-800 text-sm">{safeSource.name}</p>
          <p className="text-slate-600 mt-0.5">Pickup Point: <strong className="text-slate-900">{safeSource.pickupLocation}</strong></p>
          <p className="text-slate-500 mt-0.5">{safeSource.address}</p>
          <p className="text-emerald-700 font-medium mt-1">Phone: {safeSource.phone}</p>
        </div>

        <div className="p-3 bg-white border border-blue-200 rounded-xl">
          <div className="font-bold text-blue-800 uppercase tracking-wide flex items-center gap-1.5 mb-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>DESTINATION (Customer Dropoff)</span>
          </div>
          <p className="font-semibold text-slate-800 text-sm">{safeDestination.name}</p>
          <p className="text-slate-600 mt-0.5">Delivery Point: <strong className="text-slate-900">{safeDestination.deliveryLocation}</strong></p>
          <p className="text-slate-500 mt-0.5">{safeDestination.address}</p>
          <p className="text-blue-700 font-medium mt-1">Phone: {safeDestination.phone}</p>
        </div>
      </div>
    </div>
  );
};
