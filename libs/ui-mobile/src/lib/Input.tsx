/** @jsxImportSource nativewind */
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerClassName = '',
  className = '',
  secureTextEntry,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-gray-700 font-medium mb-2 text-sm">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center border rounded-lg px-3 py-2 ${
          error ? 'border-red-500' : 'border-gray-300'
        } bg-white`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className={`flex-1 text-base text-gray-900 ${className}`}
          placeholderTextColor="#9ca3af"
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text className="text-gray-500 text-sm">
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      )}
      {helperText && !error && (
        <Text className="text-gray-500 text-xs mt-1">{helperText}</Text>
      )}
    </View>
  );
}

export default Input;

