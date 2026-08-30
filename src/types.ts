export interface User {
  id: string;
  name: string;
  collegeName: string;
  studentIdNumber: string;
  email: string;
  department: string;
  phoneNumber?: string;
  rating: number;
  ridesCompleted: number;
  isVerified: boolean;
}

export interface RideOffer {
  id: string;
  driverName: string;
  driverCollege: string;
  driverRating: number;
  isDriverVerified: boolean;
  vehicleModel: string;
  vehiclePlate: string;
  originName: string;
  destinationName: string;
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  distanceKm: number;
  totalSeats: number;
  availableSeats: number;
  basePricePerSeat: number;
  departureTime: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  routeDeviationPercent: number;
}

export interface FuelCalculation {
  tripDistanceKm: number;
  kmPerLiter: number;
  fuelPricePerLiter: number;
  passengersCount: number;
  fuelRequiredLiters: number;
  totalFuelCost: number;
  costPerPassenger: number;
  gaugeNeedleAngle: number; // 0 to 180 deg
  co2EmissionsSavedKg: number;
}

export interface ChatMessage {
  id: string;
  rideId: string;
  senderName: string;
  isDriver: boolean;
  isVerified: boolean;
  text: string;
  timestamp: string;
  isLocationPin?: boolean;
  lat?: number;
  lng?: number;
}

export interface CarModelSpec {
  brand: string;
  model: string;
  avgKmPerLiter: number;
  fuelType: 'Petrol' | 'Diesel' | 'EV (km/eL)' | 'CNG';
}

export interface OcrScanResult {
  success: boolean;
  extractedName: string;
  extractedCollege: string;
  extractedIdNumber: string;
  extractedEmail: string;
  extractedDepartment: string;
  extractedPhone?: string;
  rawText: string;
}

export interface MapPoint {
  lat: number;
  lng: number;
  label: string;
}

export interface RouteMatchResult {
  rideOffer: RideOffer;
  deviationPercent: number;
  suggestedPickupPoint: string;
  matchScorePercent: number;
  polylinePoints: MapPoint[];
}

export type TabScreen =
  | 'home'
  | 'request'
  | 'offer'
  | 'fuel'
  | 'chat'
  | 'safety'
  | 'history'
  | 'auth';
