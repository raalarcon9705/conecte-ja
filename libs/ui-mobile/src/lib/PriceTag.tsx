/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, ViewProps } from 'react-native';

export interface PriceTagProps extends ViewProps {
  amount: string;
  period?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'success';
}

export function PriceTag({
  amount,
  period,
  size = 'md',
  variant = 'default',
  className = '',
  ...props
}: PriceTagProps) {
  const sizeStyles = {
    sm: { amount: 'text-base', period: 'text-xs' },
    md: { amount: 'text-xl', period: 'text-sm' },
    lg: { amount: 'text-3xl', period: 'text-base' },
  };

  const variantStyles = {
    default: 'text-gray-900',
    primary: 'text-blue-600',
    success: 'text-green-600',
  };

  return (
    <View className={`flex-row items-end ${className}`} {...props}>
      <Text className={`font-bold ${sizeStyles[size].amount} ${variantStyles[variant]}`}>
        {amount}
      </Text>
      {period && (
        <Text className={`${sizeStyles[size].period} text-gray-500 ml-1 mb-0.5`}>
          /{period}
        </Text>
      )}
    </View>
  );
}

export default PriceTag;

