import React from 'react';
import {
  Car,
  Search,
  PlusCircle,
  Fuel,
  ShieldCheck,
  MessageSquare,
  TrendingUp,
  Leaf,
  Users,
  Clock,
  Sparkles,
  Shield,
  History,
} from 'lucide-react';
import { RideOffer, TabScreen, User } from '../types';

interface HomeScreenProps {
  currentUser: User | null;
  activeRide: RideOffer | null;
  onNavigate: (tab: TabScreen) => void;
  onSelectRide: (ride: RideOffer) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  activeRide,
  onNavigate,
  onSelectRide: _onSelectRide,
}) => {
  return (
    <div className="space-y-4 pb-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-950 p-5 sm:p-6 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-[11px] font-semibold w-fit">
            <Sparkles className="w-3 h-3 text-indigo-300" />
            Verified Campus Carpool Network
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1 font-['Outfit',sans-serif]">
              {currentUser ? `Welcome back, ${currentUser.name.split(' ')[0]} 👋` : 'Smart Campus Carpools 🚗'}
            </h1>
            <p className="text-xs text-indigo-100/80 leading-relaxed">
              {currentUser ? (
                <>Share rides with students from <strong className="text-white">{currentUser.collegeName}</strong>.</>
              ) : (
                <>Fair-share fuel calculation and verified student ride-sharing for your campus.</>
              )}
            </p>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => onNavigate('request')}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-white text-indigo-950 font-black text-xs hover:bg-indigo-50 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5 text-indigo-600" />
              Find Ride
            </button>
            <button
              onClick={() => onNavigate('offer')}
              className="flex-1 py-2.5 px-3 rounded-2xl bg-indigo-600/90 hover:bg-indigo-600 active:scale-95 text-white font-black text-xs border border-indigo-400/40 transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <PlusCircle className="w-3.5 h-3.5 text-indigo-200" />
              Offer Seats
            </button>
          </div>
        </div>
      </div>

      {/* Quick Services 4-Grid */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 px-1">
          Campus Services
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => onNavigate('request')}
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-xs active:scale-95 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Search className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">Find Ride</div>
            <div className="text-[10px] text-slate-500">Search routes & book</div>
          </button>

          <button
            onClick={() => onNavigate('offer')}
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-xs active:scale-95 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">Offer Ride</div>
            <div className="text-[10px] text-slate-500">Post empty seats</div>
          </button>

          <button
            onClick={() => onNavigate('fuel')}
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-xs active:scale-95 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Fuel className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">Fuel Calc</div>
            <div className="text-[10px] text-slate-500">Mileage & cost split</div>
          </button>

          <button
            onClick={() => onNavigate('safety')}
            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-400 hover:shadow-xs active:scale-95 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">Safety Center</div>
            <div className="text-[10px] text-slate-500">SOS & campus guards</div>
          </button>
        </div>
      </div>

      {/* Active Scheduled Ride Card or Clean Empty State */}
      {activeRide ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="font-bold text-xs text-slate-900">Active Scheduled Ride</h3>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              ₹{activeRide.basePricePerSeat.toFixed(2)} / seat
            </span>
          </div>

          <div className="flex items-start justify-between gap-3 py-2.5 border-y border-slate-100">
            <div>
              <div className="font-bold text-sm text-slate-900 flex items-center gap-1">
                {activeRide.driverName}
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-[11px] text-slate-500">
                {activeRide.driverCollege} • ⭐ {activeRide.driverRating}
              </div>
              <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                🚗 {activeRide.vehicleModel} ({activeRide.vehiclePlate})
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-indigo-500" />
                {activeRide.departureTime}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                {activeRide.availableSeats} seats left
              </div>
            </div>
          </div>

          {/* Route path */}
          <div className="py-2 text-[11px] text-slate-600 flex items-center justify-between">
            <div className="truncate">
              <strong>Route:</strong> {activeRide.originName} ➔ {activeRide.destinationName}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-slate-100">
            <button
              onClick={() => onNavigate('chat')}
              className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Ride Chat
            </button>
            <button
              onClick={() => onNavigate('request')}
              className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              View Route
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs text-center">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
            <Car className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 mb-1">No Active Ride</h3>
          <p className="text-xs text-slate-500 mb-3">
            Search for campus carpools or post your own route to share empty seats.
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onNavigate('request')}
              className="py-2 px-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-all"
            >
              Search Rides
            </button>
            <button
              onClick={() => onNavigate('offer')}
              className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              Offer a Ride
            </button>
          </div>
        </div>
      )}

      {/* Account Verification & Trust Banner */}
      {currentUser ? (
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                Verified Student Account
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <div className="text-[11px] text-slate-500">
                {currentUser.studentIdNumber} • {currentUser.department}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-black text-indigo-600">⭐ {currentUser.rating.toFixed(1)}</div>
            <div className="text-[10px] text-slate-400 font-medium">Trust Score</div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Student ID Verification</div>
              <div className="text-[11px] text-slate-500">Verify university identity to ride or drive</div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('auth')}
            className="py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-xs"
          >
            Verify ID
          </button>
        </div>
      )}
    </div>
  );
};
