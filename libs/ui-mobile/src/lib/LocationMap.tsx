/** @jsxImportSource nativewind */
/**
 * Componente de Mapa con OpenStreetMap
 * Usa WebView con Leaflet para máxima compatibilidad con Expo
 */

import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { LocationPrivacy } from '../../../../apps/mobile/src/utils/geolocation';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  privacy?: LocationPrivacy;
  radius?: number;
  showMarker?: boolean;
  className?: string;
}

export function LocationMap({
  latitude,
  longitude,
  privacy = LocationPrivacy.APPROXIMATE,
  radius = 1000,
  showMarker = true,
  className = ''
}: LocationMapProps) {
  const showApproximate = privacy === LocationPrivacy.APPROXIMATE;
  const showExact = privacy === LocationPrivacy.EXACT;
  const zoom = showApproximate ? 13 : 15;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map').setView([${latitude}, ${longitude}], ${zoom});

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        ${showApproximate ? `
          L.circle([${latitude}, ${longitude}], {
            color: 'rgba(99, 102, 241, 0.5)',
            fillColor: 'rgba(99, 102, 241, 0.2)',
            fillOpacity: 0.3,
            radius: ${radius}
          }).addTo(map);
        ` : ''}

        ${showExact && showMarker ? `
          L.marker([${latitude}, ${longitude}])
            .addTo(map)
            .bindPopup('Ubicación');
        ` : ''}
      </script>
    </body>
    </html>
  `;

  return (
    <View className={`w-full h-[300px] rounded-xl overflow-hidden bg-gray-100 ${className}`}>
      <WebView
        source={{ html }}
        style={{ flex: 1 }}
        scrollEnabled={false}
        bounces={false}
      />
    </View>
  );
}

export default LocationMap;
