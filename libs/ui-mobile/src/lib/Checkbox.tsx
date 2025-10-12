/** @jsxImportSource nativewind */
import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
}: CheckboxProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center"
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <View
        className={`w-5 h-5 rounded border-2 items-center justify-center mr-2 ${
          checked
            ? 'bg-blue-500 border-blue-500'
            : 'bg-white border-gray-300'
        } ${disabled ? 'opacity-50' : ''}`}
      >
        {checked && <Text className="text-white text-xs font-bold">✓</Text>}
      </View>
      {label && (
        <Text className={`text-gray-700 ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default Checkbox;

