/** @jsxImportSource nativewind */
import React from 'react';
import { TouchableOpacity, View, Text, Animated } from 'react-native';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({
  value,
  onValueChange,
  label,
  disabled = false,
}: SwitchProps) {
  return (
    <View className="flex-row items-center justify-between">
      {label && (
        <Text className={`text-gray-700 flex-1 ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </Text>
      )}
      <TouchableOpacity
        className={`w-12 h-7 rounded-full p-1 ${
          value ? 'bg-blue-500' : 'bg-gray-300'
        } ${disabled ? 'opacity-50' : ''}`}
        onPress={() => !disabled && onValueChange(!value)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View
          className={`w-5 h-5 rounded-full bg-white shadow ${
            value ? 'ml-auto' : ''
          }`}
        />
      </TouchableOpacity>
    </View>
  );
}

export default Switch;

