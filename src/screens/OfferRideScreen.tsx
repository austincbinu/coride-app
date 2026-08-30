import React, { useState } from 'react';
import {
  Car,
  PlusCircle,
  MapPin,
  Clock,
  IndianRupee,
  Users,
  ShieldCheck,
  Check,
  Search,
  Sparkles,
} from 'lucide-react';
import { CarModelSpec, User, TabScreen } from '../types';
import { CARS_DATABASE, searchCars, getCarFullName } from '../data/carDatabase';
import { calculateFuelCost } from '../services/fuelCalculator';
import confetti from 'canvas-confetti';

interface OfferRideScreenProps {
  currentUser: User | null;
  onCreateRide: (
    origin: string,
    destination: string,
    availableSeats: number,
    pricePerSeat: number,
    vehicleModel: string,
    departureTime?: string,
    distanceKm?: number
  ) => void;
  onNavigate: (tab: TabScreen) => void;
}

export const OfferRideScreen: React.FC<OfferRideScreenProps> = ({
  currentUser,
  onCreateRide,
  onNavigate,
}) => {
  const [origin, setOrigin] = useState(currentUser?.collegeName ? `${currentUser.collegeName} Gate` : '');
  const [destination, setDestination] = useState('');
  const [distanceKm, setDistanceKm] = useState(15.0);
  const [seats, setSeats] = useState(3);
  const [selectedCar, setSelectedCar] = useState<CarModelSpec>(CARS_DATABASE[0]);
  const [carSearch, setCarSearch] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [departureTime, setDepartureTime] = useState('');

  const filteredCars = searchCars(carSearch);

  // Suggested fuel calculation
  const fuelCalc = calculateFuelCost(distanceKm, selectedCar.avgKmPerLiter, 105.0, seats);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;
    const price = parseFloat(customPrice) || Math.round(fuelCalc.costPerPassenger) || 50;
    onCreateRide(
      origin.trim(),
      destination.trim(),
      seats,
      price,
      getCarFullName(selectedCar),
      departureTime.trim() || 'In 30 mins',
      distanceKm
    );

    confetti({ particleCount: 70, spread: 60 });
    onNavigate('request');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          Driver Verified Profile
        </div>
        <h2 className="text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
          Offer a Campus Carpool Ride
        </h2>
        <p className="text-xs text-slate-500">
          Share your daily commute with students going your way and split fuel costs legally.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Route Details Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            Route & Schedule
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pickup Campus / Spot</label>
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. CET Main Gate / MEC Thrikkakara / GECT"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Destination Hub / City</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Thampanoor Bus Terminal / Infopark / Railway Station"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Trip Distance (km)</label>
                <input
                  type="number"
                  step="0.5"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 10)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Departure Time</label>
                <input
                  type="text"
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  placeholder="e.g. 05:30 PM Today"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Selection with Specs & Database */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Car className="w-4 h-4 text-indigo-600" />
              Vehicle Model & Mileage Database
            </h3>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {selectedCar.avgKmPerLiter} km/L ({selectedCar.fuelType})
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search car make (Swift, Nexon, Creta, City...)"
              value={carSearch}
              onChange={(e) => setCarSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
            {filteredCars.map((car) => {
              const isSelected =
                selectedCar.brand === car.brand && selectedCar.model === car.model;
              return (
                <button
                  type="button"
                  key={getCarFullName(car)}
                  onClick={() => setSelectedCar(car)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-950 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  <div className="font-bold text-slate-900 truncate">{car.brand} {car.model}</div>
                  <div className="text-[11px] text-slate-500">{car.avgKmPerLiter} km/L • {car.fuelType}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pricing & Seats Configuration */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            Seats & Fair Cost Sharing
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Available Seats (1 - 6)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setSeats(num)}
                    className={`flex-1 py-2 rounded-xl border font-bold ${
                      seats === num
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Price per Seat (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Calculated Fair Share: ₹{fuelCalc.costPerPassenger.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Post Button */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Publish Campus Ride Offer
        </button>
      </form>
    </div>
  );
};
