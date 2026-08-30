import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Car, Sparkles, Route as RouteIcon, Info } from 'lucide-react';
import { MapPoint, RideOffer } from '../types';

interface InteractiveRouteMapProps {
  ride: RideOffer;
  polylinePoints: MapPoint[];
  matchScorePercent?: number;
  deviationPercent?: number;
}

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({
  ride,
  polylinePoints,
  matchScorePercent = 94,
  deviationPercent = 2.1,
}) => {
  const [activeStep, setActiveStep] = useState(2);

  // Animate car traversing along route steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % (polylinePoints.length || 10));
    }, 2400);
    return () => clearInterval(interval);
  }, [polylinePoints.length]);

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 text-white shadow-xl relative overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <RouteIcon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Campus Route Corridor
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {matchScorePercent}% Match
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              {deviationPercent}% minor deviation from driver's direct route
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-indigo-400 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700">
            {ride.distanceKm} km
          </span>
        </div>
      </div>

      {/* Stylized SVG Campus Map Visualizer */}
      <div className="relative bg-slate-950 rounded-2xl border border-slate-800 p-4 min-h-[220px] flex flex-col justify-between overflow-hidden shadow-inner">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #6366F1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Route Corridor Polyline */}
        <svg viewBox="0 0 400 160" className="w-full h-36">
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#38BDF8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Highway Track */}
          <path
            d="M 40 120 C 120 140, 160 40, 240 60 S 320 120, 360 40"
            fill="none"
            stroke="#334155"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Active Colored Route Polyline */}
          <path
            d="M 40 120 C 120 140, 160 40, 240 60 S 320 120, 360 40"
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="6 4"
            filter="url(#glow)"
          />

          {/* Origin Pin */}
          <g transform="translate(40, 120)">
            <circle r="10" fill="#6366F1" opacity="0.3" />
            <circle r="6" fill="#6366F1" stroke="#FFFFFF" strokeWidth="2" />
          </g>

          {/* Student Pickup Spot Point */}
          <g transform="translate(200, 50)">
            <circle r="12" fill="#10B981" opacity="0.3" className="animate-ping" />
            <circle r="7" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
          </g>

          {/* Destination Pin */}
          <g transform="translate(360, 40)">
            <circle r="10" fill="#38BDF8" opacity="0.3" />
            <circle r="6" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2" />
          </g>

          {/* Moving Animated Car Icon on Route */}
          {(() => {
            // Compute approximate position along bezier curve
            const t = activeStep / (polylinePoints.length || 10);
            const carX = 40 + t * 320;
            const carY =
              Math.pow(1 - t, 3) * 120 +
              3 * Math.pow(1 - t, 2) * t * 140 +
              3 * (1 - t) * Math.pow(t, 2) * 60 +
              Math.pow(t, 3) * 40;
            return (
              <g transform={`translate(${carX}, ${carY})`}>
                <circle r="14" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
                <foreignObject x="-8" y="-8" width="16" height="16">
                  <div className="flex items-center justify-center text-white">
                    <Car className="w-4 h-4" />
                  </div>
                </foreignObject>
              </g>
            );
          })()}
        </svg>

        {/* Route Points Information Badges */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-[11px]">
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-slate-400 block font-semibold">Origin Campus:</span>
              <span className="font-bold text-slate-100 truncate block">
                {ride.originName}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-sky-400 mt-0.5 shrink-0" />
            <div>
              <span className="text-slate-400 block font-semibold">Dropoff Hub:</span>
              <span className="font-bold text-slate-100 truncate block">
                {ride.destinationName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Pickup Callout */}
      <div className="mt-3 bg-slate-800/60 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-300">
        <span className="flex items-center gap-1.5 font-medium">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          Optimal Pickup Point: <strong className="text-white">Gate B - Main Oval Circle</strong>
        </span>
        <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-md">
          ~1 min walk
        </span>
      </div>
    </div>
  );
};
