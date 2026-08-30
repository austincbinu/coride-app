import React from 'react';
import { FuelCalculation } from '../types';
import { Fuel, Users, Leaf, IndianRupee } from 'lucide-react';

interface FuelGaugeCanvasProps {
  calculation: FuelCalculation;
}

export const FuelGaugeCanvas: React.FC<FuelGaugeCanvasProps> = ({ calculation }) => {
  // Gauge angles: Semi-circle from 180° (left, high consumption) to 0° (right, super eco)
  // needleAngle is 0 (right/eco) to 180 (left/heavy)
  const needleAngle = Math.min(180, Math.max(0, calculation.gaugeNeedleAngle));
  // Needle rotation in degrees for transform (0deg at bottom, or -90 to +90 from top)
  const needleRotateDeg = -180 + (180 - needleAngle);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Fuel className="w-5 h-5 text-indigo-600" />
            Live Efficiency & Split Gauge
          </h3>
          <p className="text-xs text-slate-500">
            Real-time fuel burn rate & fair passenger cost distribution
          </p>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
          {calculation.kmPerLiter} km/L
        </span>
      </div>

      {/* SVG Semi-Circle Speedometer Gauge */}
      <div className="relative flex flex-col items-center justify-center my-2">
        <svg viewBox="0 0 240 140" className="w-64 h-36 max-w-full">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="35%" stopColor="#F59E0B" />
              <stop offset="70%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id="needleShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Colored Meter Arc */}
          <path
            d="M 20 120 A 100 100 0 0 1 220 120"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Ticks and Markings */}
          <text x="18" y="136" fontSize="10" fontWeight="bold" fill="#64748B">5 km/L</text>
          <text x="105" y="42" fontSize="10" fontWeight="bold" fill="#64748B">17 km/L</text>
          <text x="185" y="136" fontSize="10" fontWeight="bold" fill="#64748B">30+ km/L</text>

          {/* Gauge Center Needle */}
          <g transform={`translate(120, 120) rotate(${needleRotateDeg})`} filter="url(#needleShadow)">
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="-85"
              stroke="#4F46E5"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="0" cy="0" r="8" fill="#4F46E5" />
            <circle cx="0" cy="0" r="3" fill="#FFFFFF" />
          </g>
        </svg>

        {/* Center Cost Callout */}
        <div className="text-center -mt-4">
          <div className="text-3xl font-extrabold text-indigo-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6 -mr-1" />
            {calculation.costPerPassenger.toFixed(2)}
          </div>
          <div className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            Cost per Student ({calculation.passengersCount + 1} ways split)
          </div>
        </div>
      </div>

      {/* Tri-stat breakdown metrics */}
      <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
        <div>
          <div className="text-xs text-slate-500 font-medium">Fuel Needed</div>
          <div className="text-sm font-extrabold text-slate-800">
            {calculation.fuelRequiredLiters.toFixed(2)} L
          </div>
        </div>

        <div className="border-x border-slate-200">
          <div className="text-xs text-slate-500 font-medium">Total Trip Fuel</div>
          <div className="text-sm font-extrabold text-slate-800">
            ₹{calculation.totalFuelCost.toFixed(2)}
          </div>
        </div>

        <div>
          <div className="text-xs text-emerald-600 font-medium flex items-center justify-center gap-0.5">
            <Leaf className="w-3 h-3 text-emerald-500" />
            CO₂ Saved
          </div>
          <div className="text-sm font-extrabold text-emerald-600">
            {calculation.co2EmissionsSavedKg.toFixed(1)} kg
          </div>
        </div>
      </div>
    </div>
  );
};
