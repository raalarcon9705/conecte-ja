/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export interface ServiceCardProps {
  id: string;
  name: string;
  description?: string;
  price?: string;
  duration?: string;
  onPress?: () => void;
  isSelected?: boolean;
}

export function ServiceCard({
  name,
  description,
  price,
  duration,
  onPress,
  isSelected = false,
}: ServiceCardProps) {
  return (
    <TouchableOpacity
      className={`bg-white rounded-xl p-4 mb-3 border-2 ${
        isSelected ? 'border-blue-500' : 'border-gray-200'
      }`}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-bold text-gray-900 flex-1">{name}</Text>
        {isSelected && <Text className="text-blue-500 text-xl">✓</Text>}
      </View>
      
      {description && (
        <Text className="text-sm text-gray-600 mb-3">{description}</Text>
      )}
      
      <View className="flex-row items-center justify-between">
        {duration && (
          <Text className="text-sm text-gray-500">⏱️ {duration}</Text>
        )}
        {price && (
          <Text className="text-lg font-bold text-blue-600">{price}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default ServiceCard;

