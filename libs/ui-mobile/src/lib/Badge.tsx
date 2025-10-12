/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, ViewProps } from 'react-native';

export interface BadgeProps extends ViewProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Badge({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    primary: 'bg-blue-100 border-blue-200',
    secondary: 'bg-gray-100 border-gray-200',
    success: 'bg-green-100 border-green-200',
    warning: 'bg-yellow-100 border-yellow-200',
    danger: 'bg-red-100 border-red-200',
    info: 'bg-cyan-100 border-cyan-200',
  };

  const textVariantStyles = {
    primary: 'text-blue-700',
    secondary: 'text-gray-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700',
    info: 'text-cyan-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-2.5 py-1',
    lg: 'px-3 py-1.5',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <View
      className={`rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      <Text className={`${textVariantStyles[variant]} ${textSizeStyles[size]} font-medium`}>
        {children}
      </Text>
    </View>
  );
}

export default Badge;

