import { CarModelSpec } from '../types';

export const CARS_DATABASE: CarModelSpec[] = [
  { brand: 'Maruti Suzuki', model: 'Swift 1.2L DualJet', avgKmPerLiter: 22.5, fuelType: 'Petrol' },
  { brand: 'Hyundai', model: 'i20 N Line 1.0L Turbo', avgKmPerLiter: 20.0, fuelType: 'Petrol' },
  { brand: 'Tata', model: 'Nexon EV Max', avgKmPerLiter: 55.0, fuelType: 'EV (km/eL)' },
  { brand: 'Honda', model: 'City 1.5L i-VTEC', avgKmPerLiter: 18.4, fuelType: 'Petrol' },
  { brand: 'Maruti Suzuki', model: 'Baleno 1.2L K12N', avgKmPerLiter: 22.3, fuelType: 'Petrol' },
  { brand: 'Tata', model: 'Punch 1.2L Revotron', avgKmPerLiter: 18.8, fuelType: 'Petrol' },
  { brand: 'Hyundai', model: 'Creta 1.5L CRDi', avgKmPerLiter: 21.0, fuelType: 'Diesel' },
  { brand: 'Mahindra', model: 'XUV700 AX7', avgKmPerLiter: 13.5, fuelType: 'Diesel' },
  { brand: 'Toyota', model: 'Innova Crysta 2.4L', avgKmPerLiter: 15.2, fuelType: 'Diesel' },
  { brand: 'Volkswagen', model: 'Virtus 1.0L TSI', avgKmPerLiter: 19.4, fuelType: 'Petrol' },
];

export function getCarFullName(car: CarModelSpec): string {
  return `${car.brand} ${car.model} (${car.avgKmPerLiter} km/L ${car.fuelType})`;
}

export function searchCars(query: string): CarModelSpec[] {
  if (!query || query.trim() === '') {
    return [...CARS_DATABASE];
  }
  const lower = query.toLowerCase().trim();
  return CARS_DATABASE.filter(
    (car) =>
      car.brand.toLowerCase().includes(lower) ||
      car.model.toLowerCase().includes(lower) ||
      getCarFullName(car).toLowerCase().includes(lower)
  );
}

export function getDefaultCar(): CarModelSpec {
  return CARS_DATABASE[0];
}
