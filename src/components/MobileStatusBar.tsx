import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, SignalHigh } from 'lucide-react';

export const MobileStatusBar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-white/95 backdrop-blur-md px-6 py-2 flex items-center justify-between text-slate-900 text-xs font-bold select-none border-b border-slate-100/50 z-50">
      {/* Time */}
      <span className="tracking-tight text-[12px] font-extrabold">{currentTime || '09:41'}</span>

      {/* Center Dynamic Island / Notch Mockup */}
      <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center px-2 gap-1.5 shadow-xs">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
        <div className="w-2 h-2 rounded-full bg-slate-950 border border-slate-700/50" />
      </div>

      {/* Network & Battery */}
      <div className="flex items-center gap-1.5 text-slate-800">
        <SignalHigh className="w-3.5 h-3.5" />
        <Wifi className="w-3.5 h-3.5" />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px] font-extrabold font-mono">88%</span>
          <BatteryMedium className="w-4 h-4 text-emerald-600" />
        </div>
      </div>
    </div>
  );
};
