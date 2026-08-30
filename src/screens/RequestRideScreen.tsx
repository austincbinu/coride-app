import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  BookmarkCheck,
  Car,
  Navigation,
} from 'lucide-react';
import { RideOffer, User } from '../types';
import { InteractiveRouteMap } from '../components/InteractiveRouteMap';
import { matchRoute } from '../services/routeMatchingEngine';
import confetti from 'canvas-confetti';

interface RequestRideScreenProps {
  currentUser: User | null;
  rideOffers: RideOffer[];
  bookedRideIds: string[];
  onBookRide: (rideId: string) => void;
  onDeleteRide?: (rideId: string) => void;
  onSelectRideForTracking?: (ride: RideOffer) => void;
}

export const RequestRideScreen: React.FC<RequestRideScreenProps> = ({
  currentUser,
  rideOffers,
  bookedRideIds,
  onBookRide,
  onDeleteRide,
  onSelectRideForTracking,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRide, setSelectedRide] = useState<RideOffer | null>(
    rideOffers[0] || null
  );

  const filteredRides = rideOffers.filter((ride) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      ride.originName.toLowerCase().includes(q) ||
      ride.destinationName.toLowerCase().includes(q) ||
      ride.driverName.toLowerCase().includes(q) ||
      ride.driverCollege.toLowerCase().includes(q)
    );
  });

  const routeMatch = selectedRide ? matchRoute(selectedRide) : null;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
            Campus Ride Directory
          </h2>
          <p className="text-xs text-slate-500">
            Real-time verified student carpools & instant seat reservation
          </p>
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campus or destination..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>
      </div>

      {/* Interactive Map Visualizer for Selected Ride */}
      {selectedRide && routeMatch && (
        <InteractiveRouteMap
          ride={selectedRide}
          polylinePoints={routeMatch.polylinePoints}
          matchScorePercent={routeMatch.matchScorePercent}
          deviationPercent={routeMatch.deviationPercent}
        />
      )}

      {/* Available Rides List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800">
            Available Student Rides ({filteredRides.length})
          </h3>
          <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
            All 100% Student Verified
          </span>
        </div>

        <div className="space-y-3">
          {filteredRides.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <Car className="w-6 h-6" />
              </div>
              <h4 className="font-black text-slate-900 text-sm mb-1">No Active Ride Offers</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                {searchQuery
                  ? `No rides match "${searchQuery}". Try a different location search.`
                  : 'There are currently no active campus carpool offers posted. Tap Offer Ride to create the first one!'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          ) : (
            filteredRides.map((ride) => {
            const isBooked = bookedRideIds.includes(ride.id);
            const isSelected = selectedRide?.id === ride.id;

            return (
              <div
                key={ride.id}
                onClick={() => setSelectedRide(ride)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer bg-white ${
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Driver Info Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">
                      {ride.driverName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                        {ride.driverName}
                        {ride.isDriverVerified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {ride.driverCollege} • ⭐ {ride.driverRating}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-indigo-600">
                      ₹{ride.basePricePerSeat.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">per seat</div>
                  </div>
                </div>

                {/* Route points */}
                <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-1.5 border border-slate-100 mb-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="font-semibold">{ride.originName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Navigation className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    <span className="font-semibold">{ride.destinationName}</span>
                  </div>
                </div>

                {/* Specs */}
                <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {ride.departureTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Car className="w-3.5 h-3.5 text-slate-400" />
                    {ride.vehicleModel}
                  </span>
                  <span className="font-bold text-emerald-600">
                    {ride.availableSeats} seats left
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      if (!isBooked) {
                        onBookRide(ride.id);
                        confetti({ particleCount: 70, spread: 50 });
                      }
                    }}
                    className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                      isBooked
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {isBooked ? (
                      <>
                        <BookmarkCheck className="w-4 h-4" />
                        Seat Confirmed ✓
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Book Seat
                      </>
                    )}
                  </button>

                  {onDeleteRide && (
                    <button
                      onClick={() => onDeleteRide(ride.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50"
                      title="Remove ride"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
};
