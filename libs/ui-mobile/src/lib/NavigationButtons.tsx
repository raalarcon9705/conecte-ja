/** @jsxImportSource nativewind */
/**
 * Componente de Botones de Navegación
 * Permite abrir la ubicación en diferentes apps de transporte y mapas
 */

import { NavigationApp, getNavigationApps, openNavigationApp } from '@conecteja/utils';
import React from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';

interface NavigationButtonsProps {
  latitude: number;
  longitude: number;
  onError?: (error: string) => void;
  className?: string;
}

export function NavigationButtons({
  latitude,
  longitude,
  onError,
  className = ''
}: NavigationButtonsProps) {
  const apps = getNavigationApps(latitude, longitude);

  const handleAppPress = async (app: NavigationApp) => {
    await openNavigationApp(app, onError);
  };

  return (
    <View className={`py-4 ${className}`}>
      <Text className="text-base font-semibold mb-3 px-4 text-gray-900">
        Abrir en:
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {apps.map((app) => (
          <TouchableOpacity
            key={app.id}
            className="bg-blue-600 px-5 py-3 rounded-lg mr-2 active:bg-blue-700"
            onPress={() => handleAppPress(app)}
          >
            <Text className="text-white text-sm font-semibold">
              {app.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default NavigationButtons;
