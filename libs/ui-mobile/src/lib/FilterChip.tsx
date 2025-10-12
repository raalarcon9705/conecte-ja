/** @jsxImportSource nativewind */
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

export interface FilterChipProps {
  label: string;
  isActive?: boolean;
  count?: number;
  icon?: React.ReactNode;
  onPress?: () => void;
}

export function FilterChip({
  label,
  isActive = false,
  count,
  icon,
  onPress,
}: FilterChipProps) {
  return (
    <TouchableOpacity
      className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
        isActive ? 'bg-blue-500' : 'bg-white border border-gray-300'
      }`}
      onPress={onPress}
    >
      {icon && <View className="mr-1">{icon}</View>}
      <Text
        className={`font-medium ${
          isActive ? 'text-white' : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
      {count !== undefined && (
        <View
          className={`ml-2 px-2 py-0.5 rounded-full ${
            isActive ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              isActive ? 'text-white' : 'text-gray-700'
            }`}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default FilterChip;

