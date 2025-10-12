/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, ViewProps } from 'react-native';

export interface AlertProps extends ViewProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Alert({
  variant = 'info',
  title,
  icon,
  className = '',
  children,
  ...props
}: AlertProps) {
  const variantStyles = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-yellow-50 border-yellow-200',
    error: 'bg-red-50 border-red-200',
  };

  const titleVariantStyles = {
    info: 'text-blue-900',
    success: 'text-green-900',
    warning: 'text-yellow-900',
    error: 'text-red-900',
  };

  const textVariantStyles = {
    info: 'text-blue-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    error: 'text-red-700',
  };

  return (
    <View
      className={`p-4 rounded-lg border ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <View className="flex-row">
        {icon && <View className="mr-3">{icon}</View>}
        <View className="flex-1">
          {title && (
            <Text className={`font-semibold mb-1 ${titleVariantStyles[variant]}`}>
              {title}
            </Text>
          )}
          <Text className={textVariantStyles[variant]}>
            {children}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default Alert;

