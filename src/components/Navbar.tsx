import React from 'react';
import { User, TabScreen } from '../types';
import { ShieldCheck, Car, AlertOctagon, ArrowLeft, LogOut } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentTab: TabScreen;
  onNavigate: (tab: TabScreen) => void;
  onTriggerSos: () => void;
  onOpenAuth: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  onNavigate,
  onTriggerSos,
  onOpenAuth,
  onLogout,
}) => {
  const isHome = currentTab === 'home';

  const tabTitles: Record<TabScreen, string> = {
    home: 'CoRide Mobile',
    request: 'Find Campus Ride',
    offer: 'Offer a Ride',
    fuel: 'Fuel Calculator',
    chat: 'Ride Messages',
    safety: 'Safety Center',
    history: 'Trip History',
    auth: 'Student ID Scan',
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 py-2.5 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        {/* Left Side: Brand or Back Button */}
        <div className="flex items-center gap-2">
          {!isHome ? (
            <button
              onClick={() => onNavigate('home')}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div
              onClick={() => onNavigate('home')}
              className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs"
            >
              <Car className="w-4 h-4" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm text-slate-900 tracking-tight">
                {isHome ? 'CoRide' : tabTitles[currentTab]}
              </h1>
              {isHome && (
                <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md">
                  APP
                </span>
              )}
            </div>
            {isHome && (
              <p className="text-[10px] text-slate-500 font-medium leading-none">
                {currentUser?.collegeName ? currentUser.collegeName.split(' ')[0] : 'Campus'} Carpool
              </p>
            )}
          </div>
        </div>

        {/* Center / Right Quick Actions */}
        <div className="flex items-center gap-1.5">
          {currentUser ? (
            <>
              {/* Student ID Verified Pill */}
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[11px] font-bold transition-colors"
                title="Scan / Switch Student ID"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-700 max-w-[70px] sm:max-w-[100px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                {currentUser.isVerified && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
              </button>

              {/* Log Out Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 active:scale-95 transition-all"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Log In</span>
            </button>
          )}

          {/* SOS Quick Button */}
          <button
            onClick={onTriggerSos}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-black active:scale-95 transition-all"
            title="SOS Emergency Beacon"
          >
            <AlertOctagon className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
