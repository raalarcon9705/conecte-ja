/** @jsxImportSource nativewind */
import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

export interface CategoryCardProps {
  id: string;
  name: string;
  icon: string;
  count?: number;
  onPress?: () => void;
  isActive?: boolean;
}

export function CategoryCard({
  name,
  icon,
  count,
  onPress,
  isActive = false,
}: CategoryCardProps) {
  return (
    <TouchableOpacity
      className={`items-center p-4 rounded-2xl mr-3 min-w-[100px] ${
        isActive ? 'bg-blue-500' : 'bg-white border border-gray-200'
      }`}
      onPress={onPress}
    >
      <Text className="text-3xl mb-2">{icon}</Text>
      <Text
        className={`text-sm font-medium text-center ${
          isActive ? 'text-white' : 'text-gray-900'
        }`}
        numberOfLines={2}
      >
        {name}
      </Text>
      {count !== undefined && (
        <Text
          className={`text-xs mt-1 ${
            isActive ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {count} pros
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default CategoryCard;

