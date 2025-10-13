/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export interface StatCardProps {
  icon: string | React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onPress?: () => void;
}

export function StatCard({
  icon,
  label,
  value,
  trend,
  onPress,
}: StatCardProps) {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      className="bg-white rounded-xl p-4 border border-gray-100 flex-1 active:opacity-70"
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-2xl">{icon}</Text>
        {trend && (
          <View className={`px-2 py-1 rounded-full ${trend.isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-xs font-semibold ${trend.isPositive ? 'text-green-700' : 'text-red-700'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>
      
      <Text className="text-2xl font-bold text-gray-900 mb-1">{value}</Text>
      <Text className="text-sm text-gray-500">{label}</Text>
    </Component>
  );
}

export default StatCard;

