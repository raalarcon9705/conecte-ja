/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, TouchableOpacity, ViewProps } from 'react-native';

export interface LocationTagProps extends ViewProps {
  location: string;
  distance?: number;
  onPress?: () => void;
}

export function LocationTag({
  location,
  distance,
  onPress,
  className = '',
  ...props
}: LocationTagProps) {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      className={`flex-row items-center bg-gray-100 px-3 py-2 rounded-full ${className}`}
      onPress={onPress}
      {...props}
    >
      <Text className="text-base mr-1">📍</Text>
      <Text className="text-sm text-gray-700 font-medium">{location}</Text>
      {distance !== undefined && (
        <Text className="text-xs text-gray-500 ml-1">
          ({distance.toFixed(1)} km)
        </Text>
      )}
    </Component>
  );
}

export default LocationTag;

