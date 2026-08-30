import { FuelCalculation } from '../types';

export function calculateFuelCost(
  tripDistanceKm: number,
  kmPerLiter: number,
  fuelPricePerLiter: number,
  passengersCount: number
): FuelCalculation {
  const safeKmPerL = kmPerLiter > 0 ? kmPerLiter : 15.0;
  const safePassengers = Math.max(1, passengersCount);
  const fuelRequiredLiters = tripDistanceKm / safeKmPerL;
  const totalFuelCost = fuelRequiredLiters * fuelPricePerLiter;
  const costPerPassenger = totalFuelCost / (safePassengers + 1); // Driver + Passengers

  // Calculate gauge needle angle (0 deg = super eco, 180 deg = high consumption)
  // Range 5 km/L (180deg) to 30 km/L (0deg)
  const normalized = 1.0 - Math.min(1.0, Math.max(0.0, (safeKmPerL - 5.0) / 25.0));
  const gaugeNeedleAngle = normalized * 180.0;

  // CO2 saved vs driving solo in kg
  const co2EmissionsSavedKg = tripDistanceKm * 0.12 * safePassengers;

  return {
    tripDistanceKm,
    kmPerLiter: safeKmPerL,
    fuelPricePerLiter,
    passengersCount: safePassengers,
    fuelRequiredLiters,
    totalFuelCost,
    costPerPassenger,
    gaugeNeedleAngle,
    co2EmissionsSavedKg,
  };
}
