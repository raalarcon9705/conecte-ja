/**
 * Servicio de Geolocalización y Privacidad
 * Maneja la aproximación de ubicaciones para proteger la privacidad del usuario
 */

export enum LocationPrivacy {
  HIDDEN = 'hidden',           // No mostrar ubicación
  APPROXIMATE = 'approximate', // Mostrar área aproximada (default)
  EXACT = 'exact'             // Mostrar dirección exacta (post-booking)
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface ApproximateLocation {
  approximate: {
    latitude: number;
    longitude: number;
  };
  radius: number; // metros
}

/**
 * Aproxima una ubicación reduciendo la precisión de las coordenadas
 * @param lat Latitud
 * @param lng Longitud
 * @param precision Número de decimales (2 = ~1km, 3 = ~100m)
 * @returns Ubicación aproximada con radio
 */
export function approximateLocation(
  lat: number,
  lng: number,
  precision: number = 2
): ApproximateLocation {
  return {
    approximate: {
      latitude: parseFloat(lat.toFixed(precision)),
      longitude: parseFloat(lng.toFixed(precision))
    },
    radius: precision === 2 ? 1000 : precision === 3 ? 100 : 10
  };
}

/**
 * Calcula la distancia entre dos puntos en metros (fórmula de Haversine)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
}

/**
 * Formatea la distancia para mostrar al usuario
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

