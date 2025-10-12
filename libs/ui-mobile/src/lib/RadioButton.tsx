/** @jsxImportSource nativewind */
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

export interface RadioButtonProps {
  selected: boolean;
  onSelect: () => void;
  label?: string;
  disabled?: boolean;
}

export function RadioButton({
  selected,
  onSelect,
  label,
  disabled = false,
}: RadioButtonProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center"
      onPress={onSelect}
      disabled={disabled}
    >
      <View
        className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-2 ${
          selected
            ? 'border-blue-500'
            : 'border-gray-300'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        {selected && (
          <View className="w-3 h-3 rounded-full bg-blue-500" />
        )}
      </View>
      {label && (
        <Text className={`text-gray-700 ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default RadioButton;

