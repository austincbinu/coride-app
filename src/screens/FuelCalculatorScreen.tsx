import React, { useState } from 'react';
import { Fuel, Car, Users, IndianRupee, Leaf, Sparkles, Search } from 'lucide-react';
import { CarModelSpec, FuelCalculation } from '../types';
import { CARS_DATABASE, searchCars, getCarFullName } from '../data/carDatabase';
import { calculateFuelCost } from '../services/fuelCalculator';
import { FuelGaugeCanvas } from '../components/FuelGaugeCanvas';

export const FuelCalculatorScreen: React.FC = () => {
  const [distanceKm, setDistanceKm] = useState(18.4);
  const [selectedCar, setSelectedCar] = useState<CarModelSpec>(CARS_DATABASE[0]);
  const [customKmPerL, setCustomKmPerL] = useState(22.5);
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState(105.0);
  const [passengersCount, setPassengersCount] = useState(3);
  const [carSearch, setCarSearch] = useState('');

  const filteredCars = searchCars(carSearch);

  const calculation = calculateFuelCost(
    distanceKm,
    customKmPerL,
    fuelPricePerLiter,
    passengersCount
  );

  const handleSelectCar = (car: CarModelSpec) => {
    setSelectedCar(car);
    setCustomKmPerL(car.avgKmPerLiter);
    if (car.fuelType.includes('EV')) {
      setFuelPricePerLiter(12.0); // Cost per unit (kWh/eL)
    } else if (car.fuelType === 'Diesel') {
      setFuelPricePerLiter(94.0);
    } else {
      setFuelPricePerLiter(105.0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
          <Fuel className="w-3.5 h-3.5 text-indigo-600" />
          Campus Fuel Fair-Share Engine
        </div>
        <h2 className="text-xl font-black text-slate-900 font-['Outfit',sans-serif]">
          Fuel Cost & Carbon Calculator
        </h2>
        <p className="text-xs text-slate-500">
          Compute accurate fuel splits based on exact vehicle mileage, distance, and student passenger count.
        </p>
      </div>

      {/* Interactive Fuel Gauge */}
      <FuelGaugeCanvas calculation={calculation} />

      {/* Vehicle Database Quick Picker */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Car className="w-4 h-4 text-indigo-600" />
            Pick Vehicle Preset
          </h3>
          <span className="text-xs font-bold text-indigo-600">
            {selectedCar.brand} {selectedCar.model}
          </span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cars (Swift, i20, Nexon EV, City, Creta...)"
            value={carSearch}
            onChange={(e) => setCarSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
          {filteredCars.map((car) => {
            const isSelected =
              selectedCar.brand === car.brand && selectedCar.model === car.model;
            return (
              <button
                key={getCarFullName(car)}
                onClick={() => handleSelectCar(car)}
                className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 font-bold text-indigo-950 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                }`}
              >
                <div className="font-bold text-slate-900 truncate">{car.brand} {car.model}</div>
                <div className="text-[10px] text-slate-500">
                  {car.avgKmPerLiter} km/L • {car.fuelType}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calculation Sliders & Inputs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5 text-xs">
        {/* Distance Slider */}
        <div>
          <div className="flex justify-between font-bold text-slate-700 mb-2">
            <span>Trip One-Way Distance</span>
            <span className="text-indigo-600 font-extrabold text-sm">{distanceKm} km</span>
          </div>
          <input
            type="range"
            min="2"
            max="120"
            step="1"
            value={distanceKm}
            onChange={(e) => setDistanceKm(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>2 km (Local Campus)</span>
            <span>60 km (Inter-city)</span>
            <span>120 km (Long)</span>
          </div>
        </div>

        {/* Mileage Slider */}
        <div>
          <div className="flex justify-between font-bold text-slate-700 mb-2">
            <span>Vehicle Fuel Economy</span>
            <span className="text-indigo-600 font-extrabold text-sm">{customKmPerL} km/L</span>
          </div>
          <input
            type="range"
            min="6"
            max="55"
            step="0.5"
            value={customKmPerL}
            onChange={(e) => setCustomKmPerL(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Fuel Price & Passengers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Fuel Price (₹ / Liter)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                step="1"
                value={fuelPricePerLiter}
                onChange={(e) => setFuelPricePerLiter(parseFloat(e.target.value) || 100)}
                className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Passengers Riding (Split With)
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPassengersCount(num)}
                  className={`flex-1 py-2 rounded-xl font-bold border text-xs ${
                    passengersCount === num
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
