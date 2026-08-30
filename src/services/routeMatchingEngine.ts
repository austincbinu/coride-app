import { MapPoint, RideOffer, RouteMatchResult } from '../types';

export function generatePolyline(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  steps: number = 12
): MapPoint[] {
  const points: MapPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    const lat = startLat + (endLat - startLat) * fraction;
    const lng = startLng + (endLng - startLng) * fraction;
    // Add realistic curved route polyline displacement
    const bend = Math.sin(fraction * Math.PI) * 0.005;
    points.push({
      lat: lat + bend,
      lng: lng - bend,
      label:
        i === 0
          ? 'Origin'
          : i === steps
          ? 'Destination'
          : `Waypoint ${i}`,
    });
  }
  return points;
}

export function matchRoute(
  offer: RideOffer,
  _userPickupLocation: string = 'Campus Gate'
): RouteMatchResult {
  const hashCode = offer.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const deviation = Math.round((1.4 + (hashCode % 25) / 10.0) * 10) / 10;
  const matchScore = Math.max(78, 100 - Math.round(deviation * 5));
  const suggestedPickup = `Gate B - Main Oval Campus Circle (${deviation}% deviation)`;
  const polyline = generatePolyline(
    offer.originLat,
    offer.originLng,
    offer.destLat,
    offer.destLng
  );

  return {
    rideOffer: offer,
    deviationPercent: deviation,
    suggestedPickupPoint: suggestedPickup,
    matchScorePercent: matchScore,
    polylinePoints: polyline,
  };
}
