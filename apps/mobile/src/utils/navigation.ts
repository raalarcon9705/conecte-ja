/**
 * Servicio de Deep Links para Apps de Navegación
 * Permite abrir ubicaciones en apps de transporte y mapas
 */

import { Platform, Linking, Alert } from 'react-native';

export interface NavigationApp {
  id: string;
  name: string;
  icon?: string;
  url: string;
  webUrl?: string;
}

/**
 * Genera URLs de deep links para diferentes apps de navegación
 */
export function getNavigationApps(latitude: number, longitude: number): NavigationApp[] {
  const apps: NavigationApp[] = [
    // Apps de transporte
    {
      id: 'uber',
      name: 'Uber',
      url: `uber://?action=setPickup&pickup=my_location&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}`,
      webUrl: `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${latitude}&dropoff[longitude]=${longitude}`
    },
    {
      id: '99taxi',
      name: '99',
      url: `99taxi://routeRequest?destiny=${latitude},${longitude}`,
      webUrl: `https://99app.com`
    },

    // Apps de mapas
    {
      id: 'waze',
      name: 'Waze',
      url: `waze://?ll=${latitude},${longitude}&navigate=yes`,
      webUrl: `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`
    },
    {
      id: 'google-maps',
      name: 'Google Maps',
      url: Platform.OS === 'ios'
        ? `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`
        : `google.navigation:q=${latitude},${longitude}`,
      webUrl: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    },
    {
      id: 'apple-maps',
      name: 'Apple Maps',
      url: `maps://?daddr=${latitude},${longitude}`,
      webUrl: `https://maps.apple.com/?daddr=${latitude},${longitude}`
    }
  ];

  // En iOS, no mostrar Apple Maps como opción de deep link (es el default)
  // En Android, no mostrar Apple Maps
  if (Platform.OS === 'android') {
    return apps.filter(app => app.id !== 'apple-maps');
  }

  return apps;
}

/**
 * Abre una app de navegación con la ubicación especificada
 */
export async function openNavigationApp(
  app: NavigationApp,
  onError?: (error: string) => void
): Promise<void> {
  try {
    const canOpen = await Linking.canOpenURL(app.url);

    if (canOpen) {
      await Linking.openURL(app.url);
    } else {
      // Si no puede abrir el deep link, intentar con web
      if (app.webUrl) {
        await Linking.openURL(app.webUrl);
      } else {
        const errorMsg = `No tienes ${app.name} instalado`;
        if (onError) {
          onError(errorMsg);
        } else {
          Alert.alert('App no disponible', errorMsg);
        }
      }
    }
  } catch (error) {
    const errorMsg = `Error al abrir ${app.name}`;
    console.error(errorMsg, error);
    if (onError) {
      onError(errorMsg);
    } else {
      Alert.alert('Error', errorMsg);
    }
  }
}

/**
 * Abre el selector nativo de mapas del sistema operativo
 */
export async function openSystemMaps(
  latitude: number,
  longitude: number,
  label?: string
): Promise<void> {
  const scheme = Platform.select({
    ios: 'maps:',
    android: 'geo:'
  });

  const url = Platform.select({
    ios: `${scheme}?daddr=${latitude},${longitude}`,
    android: `${scheme}${latitude},${longitude}?q=${latitude},${longitude}${label ? `(${label})` : ''}`
  });

  if (url) {
    await Linking.openURL(url);
  }
}
