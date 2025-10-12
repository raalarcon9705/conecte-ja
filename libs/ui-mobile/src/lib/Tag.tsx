/** @jsxImportSource nativewind */
import React from 'react';
import { View, Text, TouchableOpacity, ViewProps } from 'react-native';

export interface TagProps extends ViewProps {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
  onPress?: () => void;
  onRemove?: () => void;
  children: React.ReactNode;
}

export function Tag({
  variant = 'default',
  icon,
  onPress,
  onRemove,
  className = '',
  children,
  ...props
}: TagProps) {
  const variantStyles = {
    default: 'bg-gray-100',
    primary: 'bg-blue-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    danger: 'bg-red-100',
  };

  const textVariantStyles = {
    default: 'text-gray-700',
    primary: 'text-blue-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700',
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      className={`flex-row items-center px-3 py-1.5 rounded-full ${variantStyles[variant]} ${className}`}
      onPress={onPress}
      {...props}
    >
      {icon && <View className="mr-1">{icon}</View>}
      <Text className={`${textVariantStyles[variant]} text-sm font-medium`}>
        {children}
      </Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} className="ml-2">
          <Text className={`${textVariantStyles[variant]} text-xs`}>✕</Text>
        </TouchableOpacity>
      )}
    </Component>
  );
}

export default Tag;

