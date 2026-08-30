import React, { useState } from 'react';
import { History, Star, Car, ShieldCheck } from 'lucide-react';
import { User, RideOffer } from '../types';
import confetti from 'canvas-confetti';

interface HistoryRatingsScreenProps {
  currentUser: User | null;
  completedRides?: RideOffer[];
}

export const HistoryRatingsScreen: React.FC<HistoryRatingsScreenProps> = ({
  currentUser,
  completedRides = [],
}) => {
  const [ratedTrips, setRatedTrips] = useState<Record<string, number>>({});

  const handleRate = (tripId: string, stars: number) => {
    setRatedTrips((prev) => ({ ...prev, [tripId]: stars }));
    confetti({ particleCount: 30, spread: 40 });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
          <History className="w-3.5 h-3.5 text-indigo-600" />
          Campus Mobility Record
        </div>
        <h2 className="text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
          Trip History & Peer Ratings
        </h2>
        <p className="text-xs text-slate-500">
          Review previous carpools, view receipt splits, and rate peer drivers.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 text-center">
          <div className="text-xl font-black text-slate-900">
            {currentUser?.ridesCompleted ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold">Trips Taken</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 text-center">
          <div className="text-xl font-black text-indigo-600 flex items-center justify-center">
            ⭐ {currentUser?.rating ? currentUser.rating.toFixed(1) : '5.0'}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold">Campus Trust Score</div>
        </div>
      </div>

      {/* Trips List or Clean Empty State */}
      <div className="space-y-3">
        {completedRides.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <History className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 text-sm mb-1">No Completed Trips Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Once you complete campus carpools, your trip receipts, route breakdown, and driver rating options will appear here.
            </p>
          </div>
        ) : (
          completedRides.map((trip) => {
            const userRating = ratedTrips[trip.id] || 0;

            return (
              <div
                key={trip.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">{trip.departureTime}</div>
                    <div className="font-bold text-sm text-slate-900 mt-0.5 flex items-center gap-1.5">
                      {trip.driverName}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Car className="w-3.5 h-3.5 text-slate-400" />
                      {trip.vehicleModel}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-indigo-600">
                      ₹{trip.basePricePerSeat.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">per seat</div>
                  </div>
                </div>

                {/* Route */}
                <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 font-medium">
                  {trip.originName} ➔ {trip.destinationName}
                </div>

                {/* Star Rating row */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="font-semibold text-slate-500">Rate Driver:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRate(trip.id, star)}
                        className="p-1 hover:scale-125 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= userRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

